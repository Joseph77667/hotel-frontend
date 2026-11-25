import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { GuestResponse } from '../../../core/models';
import { GuestService } from '../../../core/services/guest.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { GuestFormDialogComponent } from '../guest-form-dialog/guest-form-dialog.component';

/**
 * Guest list with SERVER-SIDE search and paging:
 * unlike Amenities, the backend returns one page at a time (Page<GuestResponse>),
 * so this works even with thousands of guests.
 */
@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    PageHeaderComponent,
  ],
  templateUrl: './guest-list.component.html',
  styleUrl: './guest-list.component.css',
})
export class GuestListComponent {
  private readonly api = inject(GuestService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly columns = ['name', 'email', 'phone', 'nationality', 'createdAt'];
  readonly pageSizeOptions = [10, 20, 50];

  readonly guests = signal<GuestResponse[]>([]);
  readonly totalElements = signal(0);
  readonly loading = signal(true);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);

  readonly searchControl = new FormControl('', { nonNullable: true });
  private keyword = '';

  constructor() {
    // Wait until the user stops typing for 300 ms, then search from page 1
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.keyword = value.trim();
        this.pageIndex.set(0);
        this.load();
      });

    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .findAll({ keyword: this.keyword, page: this.pageIndex(), size: this.pageSize() })
      .subscribe({
        next: (page) => {
          this.guests.set(page.content);
          this.totalElements.set(page.page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  openDetail(guest: GuestResponse): void {
    this.router.navigate(['/guests', guest.id]);
  }

  openCreate(): void {
    this.dialog
      .open(GuestFormDialogComponent, { data: null, width: '560px' })
      .afterClosed()
      .subscribe((created?: GuestResponse) => {
        if (created) {
          this.router.navigate(['/guests', created.id]);
        }
      });
  }
}
