import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, switchMap } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { ROOM_STATUSES, RoomResponse, RoomStatus } from '../../../core/models';
import { NotificationService } from '../../../core/notification/notification.service';
import { RoomService } from '../../../core/services/room.service';
import { ConfirmService } from '../../../shared/components/confirm-dialog/confirm.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { YenPipe } from '../../../shared/pipes/yen.pipe';
import { RoomFormDialogComponent } from '../room-form-dialog/room-form-dialog.component';

interface FloorGroup {
  floor: number;
  rooms: RoomResponse[];
}

const STATUS_LABEL: Record<RoomStatus, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  CLEANING: 'Cleaning',
  MAINTENANCE: 'Maintenance',
};

/**
 * Every room as a card, grouped by floor and coloured by status.
 * - All staff: change status (e.g. housekeeping marks CLEANING → AVAILABLE)
 * - ADMIN: add, edit and delete rooms
 */
@Component({
  selector: 'app-room-board',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    YenPipe,
  ],
  templateUrl: './room-board.component.html',
  styleUrl: './room-board.component.css',
})
export class RoomBoardComponent implements OnInit {
  private readonly api = inject(RoomService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly statuses = ROOM_STATUSES;
  readonly statusLabel = STATUS_LABEL;
  readonly isAdmin = computed(() => this.auth.hasRole('ADMIN'));

  readonly rooms = signal<RoomResponse[]>([]);
  readonly loading = signal(true);
  readonly statusFilter = signal<RoomStatus | 'ALL'>('ALL');
  readonly search = signal('');

  /** How many rooms have each status (for the filter buttons). */
  readonly counts = computed(() => {
    const counts: Record<RoomStatus, number> = { AVAILABLE: 0, OCCUPIED: 0, CLEANING: 0, MAINTENANCE: 0 };
    for (const room of this.rooms()) {
      counts[room.status]++;
    }
    return counts;
  });

  /** Filtered rooms grouped by floor, floors and room numbers in order. */
  readonly floors = computed<FloorGroup[]>(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    const visible = this.rooms().filter(
      (room) =>
        (status === 'ALL' || room.status === status) &&
        (!query ||
          room.roomNumber.toLowerCase().includes(query) ||
          room.roomTypeName.toLowerCase().includes(query)),
    );

    const byFloor = new Map<number, RoomResponse[]>();
    for (const room of visible) {
      const list = byFloor.get(room.floor) ?? [];
      list.push(room);
      byFloor.set(room.floor, list);
    }

    return [...byFloor.entries()]
      .sort(([a], [b]) => a - b)
      .map(([floor, rooms]) => ({
        floor,
        rooms: rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })),
      }));
  });

  readonly visibleCount = computed(() => this.floors().reduce((sum, group) => sum + group.rooms.length, 0));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.findAll().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /**
   * Statuses staff can pick from the menu.
   * OCCUPIED is left out: it is set by check-in and cleared by check-out.
   */
  statusTargets(room: RoomResponse): RoomStatus[] {
    return (['AVAILABLE', 'CLEANING', 'MAINTENANCE'] as RoomStatus[]).filter((s) => s !== room.status);
  }

  changeStatus(room: RoomResponse, status: RoomStatus): void {
    this.api.updateStatus(room.id, status).subscribe((updated) => {
      // Replace just this room, no need to reload the whole list
      this.rooms.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
      this.notify.success(`Room ${updated.roomNumber} is now ${STATUS_LABEL[updated.status]}`);
    });
  }

  openForm(room?: RoomResponse): void {
    this.dialog
      .open(RoomFormDialogComponent, { data: room ?? null, width: '520px' })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.load();
        }
      });
  }

  delete(room: RoomResponse): void {
    this.confirm
      .ask({
        title: 'Delete room',
        message: `Delete room ${room.roomNumber}?\nRooms with reservations can't be deleted — set them to Maintenance instead.`,
        confirmText: 'Delete',
        danger: true,
      })
      .pipe(
        filter((ok) => ok),
        switchMap(() => this.api.delete(room.id)),
      )
      .subscribe(() => {
        this.notify.success(`Room ${room.roomNumber} deleted`);
        this.load();
      });
  }
}
