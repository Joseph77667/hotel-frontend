import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';

import { RESERVATION_STATUSES, ReservationResponse, ReservationStatus } from '../../../core/models';
import { ReservationService } from '../../../core/services/reservation.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { YenPipe } from '../../../shared/pipes/yen.pipe';
import { toLabel } from '../../../shared/utils/labels';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    YenPipe,
  ],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.css',
})
export class ReservationListComponent {
  private readonly api = inject(ReservationService);
  private readonly router = inject(Router);

  readonly columns = ['code', 'guest', 'room', 'stay', 'total', 'status'];
  readonly statuses = RESERVATION_STATUSES;
  readonly toLabel = toLabel;

  readonly reservations = signal<ReservationResponse[]>([]);
  readonly totalElements = signal(0);
  readonly loading = signal(true);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly status = signal<ReservationStatus | ''>('');

  readonly codeControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .findAll({ status: this.status() || undefined, page: this.pageIndex(), size: this.pageSize() })
      .subscribe({
        next: (page) => {
          this.reservations.set(page.content);
          this.totalElements.set(page.page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  changeStatus(status: ReservationStatus | ''): void {
    this.status.set(status);
    this.pageIndex.set(0);
    this.load();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  /** Jump straight to a reservation by its code, e.g. HTL-20261125-0001 */
  findByCode(): void {
    const code = this.codeControl.value.trim().toUpperCase();
    if (!code) {
      return;
    }
    this.api.findByCode(code).subscribe((reservation) => this.open(reservation));
  }

  open(reservation: ReservationResponse): void {
    this.router.navigate(['/reservations', reservation.id]);
  }
}
