import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, switchMap } from 'rxjs';

import { RoomTypeResponse } from '../../core/models';
import { NotificationService } from '../../core/notification/notification.service';
import { RoomTypeService } from '../../core/services/room-type.service';
import { ConfirmService } from '../../shared/components/confirm-dialog/confirm.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { YenPipe } from '../../shared/pipes/yen.pipe';
import { RoomTypeFormDialogComponent } from './room-type-form-dialog.component';

@Component({
  selector: 'app-room-type-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
    PageHeaderComponent,
    YenPipe,
  ],
  templateUrl: './room-type-list.component.html',
  styleUrl: './room-type-list.component.css',
})
export class RoomTypeListComponent implements OnInit {
  private readonly api = inject(RoomTypeService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);

  readonly columns = ['name', 'basePrice', 'maxOccupancy', 'amenities', 'actions'];

  readonly roomTypes = signal<RoomTypeResponse[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) {
      return this.roomTypes();
    }
    return this.roomTypes().filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.amenities.some((a) => a.name.toLowerCase().includes(query)),
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.findAll().subscribe({
      next: (data) => {
        this.roomTypes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openForm(roomType?: RoomTypeResponse): void {
    this.dialog
      .open(RoomTypeFormDialogComponent, { data: roomType ?? null, width: '560px' })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.load();
        }
      });
  }

  delete(roomType: RoomTypeResponse): void {
    this.confirm
      .ask({
        title: 'Delete room type',
        message: `Delete "${roomType.name}"?\nThis is only possible if no rooms use it.`,
        confirmText: 'Delete',
        danger: true,
      })
      .pipe(
        filter((ok) => ok),
        switchMap(() => this.api.delete(roomType.id)),
      )
      .subscribe(() => {
        this.notify.success(`"${roomType.name}" deleted`);
        this.load();
      });
    // If rooms still use it, the backend returns 400 ROOM_TYPE_IN_USE
    // and the error interceptor shows that message.
  }
}
