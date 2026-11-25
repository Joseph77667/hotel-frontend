import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';

import { GuestResponse, RoomResponse } from '../../../core/models';
import { NotificationService } from '../../../core/notification/notification.service';
import { GuestService } from '../../../core/services/guest.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { RoomService } from '../../../core/services/room.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { YenPipe } from '../../../shared/pipes/yen.pipe';
import { addDays, nightsBetween, toIsoDate, today } from '../../../shared/utils/date-utils';
import { GuestFormDialogComponent } from '../../guests/guest-form-dialog/guest-form-dialog.component';

/** The stay the user searched for (fixed once rooms are shown). */
interface Stay {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  nights: number;
}

/**
 * Booking wizard:
 *   1. Dates + guests → available rooms → pick one
 *   2. Find or create the guest
 *   3. Check the summary → create the reservation
 */
@Component({
  selector: 'app-new-reservation',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatStepperModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeaderComponent,
    YenPipe,
  ],
  templateUrl: './new-reservation.component.html',
  styleUrl: './new-reservation.component.css',
})
export class NewReservationComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly roomApi = inject(RoomService);
  private readonly guestApi = inject(GuestService);
  private readonly reservationApi = inject(ReservationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  readonly today = today();

  // ---------- Step 1: stay and room ----------
  readonly stayForm = this.fb.group({
    checkIn: this.fb.control<Date>(this.today, Validators.required),
    checkOut: this.fb.control<Date>(addDays(this.today, 1), Validators.required),
    guests: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
  });

  readonly stay = signal<Stay | null>(null);
  readonly rooms = signal<RoomResponse[] | null>(null);
  readonly searching = signal(false);
  readonly selectedRoom = signal<RoomResponse | null>(null);

  // ---------- Step 2: guest ----------
  readonly guestSearch = new FormControl('', { nonNullable: true });
  readonly guestResults = signal<GuestResponse[]>([]);
  readonly selectedGuest = signal<GuestResponse | null>(null);

  // ---------- Step 3: confirm ----------
  readonly specialRequests = new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) });
  readonly saving = signal(false);

  readonly total = computed(() => {
    const room = this.selectedRoom();
    const stay = this.stay();
    return room && stay ? room.pricePerNight * stay.nights : 0;
  });

  constructor() {
    // Changing dates or guests means the old room list is no longer valid
    this.stayForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.rooms.set(null);
      this.selectedRoom.set(null);
    });

    // Search guests while typing (at least 2 characters)
    this.guestSearch.valueChanges
      .pipe(
        debounceTime(300),
        map((text) => text.trim()),
        distinctUntilChanged(),
        switchMap((keyword) =>
          keyword.length < 2
            ? of<GuestResponse[]>([])
            : this.guestApi.findAll({ keyword, size: 5 }).pipe(
                map((page) => page.content),
                catchError(() => of<GuestResponse[]>([])),
              ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((guests) => this.guestResults.set(guests));
  }

  /** Earliest allowed check-out: the day after check-in. */
  minCheckOut(): Date {
    return addDays(this.stayForm.controls.checkIn.value ?? this.today, 1);
  }

  searchRooms(): void {
    const { checkIn, checkOut, guests } = this.stayForm.getRawValue();
    if (this.stayForm.invalid || !checkIn || !checkOut) {
      this.stayForm.markAllAsTouched();
      return;
    }
    const nights = nightsBetween(checkIn, checkOut);
    if (nights < 1) {
      this.notify.error('Check-out must be after check-in.');
      return;
    }

    this.searching.set(true);
    this.roomApi
      .findAvailable({ checkIn: toIsoDate(checkIn), checkOut: toIsoDate(checkOut), guests })
      .subscribe({
        next: (rooms) => {
          this.stay.set({ checkIn, checkOut, guests, nights });
          this.rooms.set(rooms);
          this.searching.set(false);
        },
        error: () => this.searching.set(false),
      });
  }

  selectRoom(room: RoomResponse): void {
    this.selectedRoom.set(room);
  }

  selectGuest(guest: GuestResponse): void {
    this.selectedGuest.set(guest);
    this.guestResults.set([]);
  }

  clearGuest(): void {
    this.selectedGuest.set(null);
    this.guestSearch.setValue('');
  }

  createGuest(): void {
    this.dialog
      .open(GuestFormDialogComponent, { data: null, width: '560px' })
      .afterClosed()
      .subscribe((guest?: GuestResponse) => {
        if (guest) {
          this.selectGuest(guest);
        }
      });
  }

  book(): void {
    const room = this.selectedRoom();
    const guest = this.selectedGuest();
    const stay = this.stay();
    if (!room || !guest || !stay || this.specialRequests.invalid) {
      return;
    }

    this.saving.set(true);
    this.reservationApi
      .create({
        guestId: guest.id,
        roomId: room.id,
        checkInDate: toIsoDate(stay.checkIn),
        checkOutDate: toIsoDate(stay.checkOut),
        numberOfGuests: stay.guests,
        specialRequests: this.specialRequests.value.trim() || undefined,
      })
      .subscribe({
        next: (reservation) => {
          this.notify.success(`Reservation ${reservation.reservationCode} created`);
          this.router.navigate(['/reservations', reservation.id]);
        },
        // e.g. someone else booked the room a moment ago → 409 pop-up from the interceptor
        error: () => this.saving.set(false),
      });
  }
}
