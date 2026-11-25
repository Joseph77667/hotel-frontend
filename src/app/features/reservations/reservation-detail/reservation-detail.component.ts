import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, filter, switchMap } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { InvoiceResponse, PaymentResponse, ReservationResponse } from '../../../core/models';
import { NotificationService } from '../../../core/notification/notification.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ConfirmService } from '../../../shared/components/confirm-dialog/confirm.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { YenPipe } from '../../../shared/pipes/yen.pipe';
import { toLabel } from '../../../shared/utils/labels';
import { PaymentDialogComponent, PaymentDialogData } from '../payment-dialog/payment-dialog.component';

/** The normal path of a booking, used for the progress bar at the top. */
const FLOW = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] as const;

/** /reservations/:id — details, status actions, payments and invoice. */
@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressBarModule,
    StatusBadgeComponent,
    YenPipe,
  ],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.css',
})
export class ReservationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ReservationService);
  private readonly paymentApi = inject(PaymentService);
  private readonly invoiceApi = inject(InvoiceService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly flow = FLOW;
  readonly toLabel = toLabel;
  readonly paymentColumns = ['paidAt', 'method', 'amount', 'receivedBy', 'status', 'actions'];

  readonly reservation = signal<ReservationResponse | null>(null);
  readonly balance = signal(0);
  readonly invoice = signal<InvoiceResponse | null>(null);
  readonly busy = signal(false);

  readonly isAdmin = computed(() => this.auth.hasRole('ADMIN'));
  readonly status = computed(() => this.reservation()?.status);

  /** Which buttons to show — the same rules as the backend's ALLOWED_TRANSITIONS. */
  readonly canConfirm = computed(() => this.status() === 'PENDING');
  readonly canCheckIn = computed(() => this.status() === 'CONFIRMED');
  readonly canCheckOut = computed(() => this.status() === 'CHECKED_IN');
  readonly canCancel = computed(() => this.status() === 'PENDING' || this.status() === 'CONFIRMED');
  readonly canPay = computed(
    () => this.balance() > 0 && this.status() !== 'CANCELLED' && this.status() !== 'CHECKED_OUT',
  );

  /** Position in FLOW, for the progress steps. -1 when cancelled. */
  readonly flowIndex = computed(() => {
    const status = this.status();
    return status ? FLOW.indexOf(status as (typeof FLOW)[number]) : -1;
  });

  private get id(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.findById(this.id).subscribe({
      next: (reservation) => this.show(reservation),
      error: () => this.router.navigate(['/reservations']),
    });
  }

  // ---------- Status actions ----------

  confirmBooking(): void {
    this.run(this.api.confirm(this.id), 'Reservation confirmed');
  }

  checkIn(): void {
    this.run(this.api.checkIn(this.id), 'Guest checked in');
  }

  checkOut(): void {
    if (this.balance() > 0) {
      this.notify.error('Take the remaining payment before check-out.');
      return;
    }
    this.askThenRun(
      'Check out',
      'Check out this guest? The invoice will be issued and the room set to Cleaning.',
      this.api.checkOut(this.id),
      'Guest checked out',
    );
  }

  cancel(): void {
    this.askThenRun(
      'Cancel reservation',
      'Cancel this reservation? This cannot be undone.\nRefund any deposit separately.',
      this.api.cancel(this.id),
      'Reservation cancelled',
      true,
    );
  }

  // ---------- Payments ----------

  takePayment(): void {
    const reservation = this.reservation();
    if (!reservation) {
      return;
    }
    const data: PaymentDialogData = {
      reservationId: reservation.id,
      reservationCode: reservation.reservationCode,
      balance: this.balance(),
    };
    this.dialog
      .open(PaymentDialogComponent, { data, width: '440px' })
      .afterClosed()
      .subscribe((paid) => {
        if (paid) {
          this.load();
        }
      });
  }

  refund(payment: PaymentResponse): void {
    this.confirm
      .ask({
        title: 'Refund payment',
        message: `Refund ¥${payment.amount.toLocaleString()} (${toLabel(payment.method)})?`,
        confirmText: 'Refund',
        danger: true,
      })
      .pipe(
        filter((ok) => ok),
        switchMap(() => this.paymentApi.refund(payment.id)),
      )
      .subscribe(() => {
        this.notify.success('Payment refunded');
        this.load();
      });
  }

  print(): void {
    window.print();
  }

  // ---------- Helpers ----------

  /** Shows a reservation and loads what depends on it: balance and invoice. */
  private show(reservation: ReservationResponse): void {
    this.reservation.set(reservation);
    this.paymentApi.getBalance(reservation.id).subscribe((balance) => this.balance.set(balance));

    if (reservation.invoiceNumber) {
      this.invoiceApi.findByReservation(reservation.id).subscribe((invoice) => this.invoice.set(invoice));
    }
  }

  private run(action: Observable<ReservationResponse>, successMessage: string): void {
    this.busy.set(true);
    action.subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.notify.success(successMessage);
        this.show(updated);
      },
      error: () => this.busy.set(false),
    });
  }

  private askThenRun(
    title: string,
    message: string,
    action: Observable<ReservationResponse>,
    successMessage: string,
    danger = false,
  ): void {
    this.confirm
      .ask({ title, message, confirmText: title, danger })
      .pipe(filter((ok) => ok))
      .subscribe(() => this.run(action, successMessage));
  }
}
