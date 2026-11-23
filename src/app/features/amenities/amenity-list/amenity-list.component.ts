import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, switchMap } from 'rxjs';

import { AmenityResponse } from '../../../core/models';
import { NotificationService } from '../../../core/notification/notification.service';
import { AmenityService } from '../../../core/services/amenity.service';
import { ConfirmService } from '../../../shared/components/confirm-dialog/confirm.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AmenityFormDialogComponent } from '../amenity-form-dialog/amenity-form-dialog.component';

@Component({
  selector: 'app-amenity-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
    PageHeaderComponent,
  ],
  templateUrl: './amenity-list.component.html',
  styleUrl: './amenity-list.component.css',
})
export class AmenityListComponent implements OnInit {
  private readonly api = inject(AmenityService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);

  readonly columns = ['name', 'description', 'actions'];

  readonly amenities = signal<AmenityResponse[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');

  /** Recalculated automatically when amenities() or search() changes. */
  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) {
      return this.amenities();
    }
    return this.amenities().filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        (a.description ?? '').toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.findAll().subscribe({
      next: (data) => {
        this.amenities.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** No argument = create, amenity = edit. */
  openForm(amenity?: AmenityResponse): void {
    this.dialog
      .open(AmenityFormDialogComponent, { data: amenity ?? null, width: '480px' })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.load();
        }
      });
  }

  delete(amenity: AmenityResponse): void {
    this.confirm
      .ask({
        title: 'Delete amenity',
        message: `Delete "${amenity.name}"?\nIt will also be removed from every room type that has it.`,
        confirmText: 'Delete',
        danger: true,
      })
      .pipe(
        filter((ok) => ok),
        switchMap(() => this.api.delete(amenity.id)),
      )
      .subscribe(() => {
        this.notify.success(`"${amenity.name}" deleted`);
        this.load();
      });
  }
}
