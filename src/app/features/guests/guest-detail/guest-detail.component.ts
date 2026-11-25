import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, forkJoin, switchMap } from 'rxjs';

import { GuestResponse, ReservationResponse } from '../../../core/models';
import { NotificationService } from '../../../core/notification/notification.service';
import { GuestService } from '../../../core/services/guest.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ConfirmService } from '../../../shared/components/confirm-dialog/confirm.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { YenPipe } from '../../../shared/pipes/yen.pipe';
import { GuestFormDialogComponent } from '../guest-form-dialog/guest-form-dialog.component';

/** /guests/:id — guest info, stay statistics and booking history. */
@Component({
  selector: 'app-guest-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    StatusBadgeComponent,
    YenPipe,
  ],
  templateUrl: './guest-detail.component.html',
  styleUrl: './guest-detail.component.css',
})
export class GuestDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(GuestService);
  private readonly reservationApi = inject(ReservationService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);

  readonly columns = ['code', 'room', 'dates', 'nights', 'total', 'status'];

  readonly guest = signal<GuestResponse | null>(null);
  readonly reservations = signal<ReservationResponse[]>([]);
  readonly loading = signal(true);

  /** Numbers for the summary cards. Only completed stays count towards nights and spending. */
  readonly stats = computed(() => {
    const all = this.reservations();
    const completed = all.filter((r) => r.status === 'CHECKED_OUT');
    return {
      bookings: all.length,
      completedStays: completed.length,
      nights: completed.reduce((sum, r) => sum + r.nights, 0),
      totalSpent: completed.reduce((sum, r) => sum + r.totalAmount, 0),
    };
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Load the guest and their reservations at the same time
    forkJoin({
      guest: this.api.findById(id),
      reservations: this.reservationApi.findByGuest(id),
    }).subscribe({
      next: ({ guest, reservations }) => {
        this.guest.set(guest);
        this.reservations.set(reservations);
        this.loading.set(false);
      },
      error: () => {
        // 404 message is shown by the error interceptor
        this.router.navigate(['/guests']);
      },
    });
  }

  edit(): void {
    this.dialog
      .open(GuestFormDialogComponent, { data: this.guest(), width: '560px' })
      .afterClosed()
      .subscribe((updated?: GuestResponse) => {
        if (updated) {
          this.guest.set(updated);
        }
      });
  }

  delete(): void {
    const guest = this.guest();
    if (!guest) {
      return;
    }
    this.confirm
      .ask({
        title: 'Delete guest',
        message: `Delete ${guest.firstName} ${guest.lastName}?\nGuests with reservations can't be deleted.`,
        confirmText: 'Delete',
        danger: true,
      })
      .pipe(
        filter((ok) => ok),
        switchMap(() => this.api.delete(guest.id)),
      )
      .subscribe(() => {
        this.notify.success(`${guest.firstName} ${guest.lastName} deleted`);
        this.router.navigate(['/guests']);
      });
  }

  openReservation(reservation: ReservationResponse): void {
    this.router.navigate(['/reservations', reservation.id]);
  }
}
