import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { RoomRequest, RoomResponse, RoomTypeResponse } from '../../../core/models';
import { NotificationService } from '../../../core/notification/notification.service';
import { RoomTypeService } from '../../../core/services/room-type.service';
import { RoomService } from '../../../core/services/room.service';
import { YenPipe } from '../../../shared/pipes/yen.pipe';
import { applyServerErrors, errorMessage } from '../../../shared/utils/form-errors';

type Field = 'roomNumber' | 'floor' | 'roomTypeId';

/**
 * Create / edit a room (ADMIN only).
 * Status is not edited here: it changes from the Room Board menu, check-in and check-out.
 */
@Component({
  selector: 'app-room-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    YenPipe,
  ],
  templateUrl: './room-form-dialog.component.html',
  styleUrl: './room-form-dialog.component.css',
})
export class RoomFormDialogComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(RoomService);
  private readonly roomTypeApi = inject(RoomTypeService);
  private readonly notify = inject(NotificationService);
  private readonly dialogRef = inject<MatDialogRef<RoomFormDialogComponent, boolean>>(MatDialogRef);

  readonly room = inject<RoomResponse | null>(MAT_DIALOG_DATA);
  readonly isEdit = this.room !== null;
  readonly saving = signal(false);
  readonly roomTypes = signal<RoomTypeResponse[]>([]);

  readonly form = this.fb.group({
    roomNumber: [this.room?.roomNumber ?? '', [Validators.required, Validators.maxLength(10)]],
    floor: [this.room?.floor ?? 1, [Validators.required, Validators.min(0), Validators.max(200)]],
    roomTypeId: this.fb.control<number | null>(this.room?.roomTypeId ?? null, Validators.required),
  });

  ngOnInit(): void {
    this.roomTypeApi.findAll().subscribe((types) => this.roomTypes.set(types));
  }

  error(field: Field, label: string): string | null {
    return errorMessage(this.form.controls[field], label);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    const value = this.form.getRawValue();
    const request: RoomRequest = {
      roomNumber: value.roomNumber.trim(),
      floor: value.floor,
      roomTypeId: value.roomTypeId as number,
      status: this.room?.status,           // keep the current status when editing
    };

    const call = this.room ? this.api.update(this.room.id, request) : this.api.create(request);

    call.subscribe({
      next: (saved) => {
        this.notify.success(`Room ${saved.roomNumber} ${this.isEdit ? 'updated' : 'created'}`);
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        applyServerErrors(this.form, error);
      },
    });
  }
}
