import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AmenityResponse, RoomTypeRequest, RoomTypeResponse } from '../../../core/models';
import { NotificationService } from '../../../core/notification/notification.service';
import { AmenityService } from '../../../core/services/amenity.service';
import { RoomTypeService } from '../../../core/services/room-type.service';
import { applyServerErrors, errorMessage } from '../../../shared/utils/form-errors';

type Field = 'name' | 'description' | 'basePrice' | 'maxOccupancy';

@Component({
  selector: 'app-room-type-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './room-type-form-dialog.component.html',
  styleUrl: './room-type-form-dialog.component.css',
})
export class RoomTypeFormDialogComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(RoomTypeService);
  private readonly amenityApi = inject(AmenityService);
  private readonly notify = inject(NotificationService);
  private readonly dialogRef = inject<MatDialogRef<RoomTypeFormDialogComponent, boolean>>(MatDialogRef);

  readonly roomType = inject<RoomTypeResponse | null>(MAT_DIALOG_DATA);
  readonly isEdit = this.roomType !== null;
  readonly saving = signal(false);
  readonly amenityOptions = signal<AmenityResponse[]>([]);

  readonly form = this.fb.group({
    name: [this.roomType?.name ?? '', [Validators.required, Validators.maxLength(50)]],
    description: [this.roomType?.description ?? '', Validators.maxLength(500)],
    basePrice: [this.roomType?.basePrice ?? 10000, [Validators.required, Validators.min(1)]],
    maxOccupancy: [this.roomType?.maxOccupancy ?? 2, [Validators.required, Validators.min(1), Validators.max(20)]],
    amenityIds: this.fb.control<number[]>(this.roomType?.amenities.map((a) => a.id) ?? []),
  });

  ngOnInit(): void {
    this.amenityApi.findAll().subscribe((list) => this.amenityOptions.set(list));
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
    const request: RoomTypeRequest = {
      name: value.name.trim(),
      description: value.description.trim() || undefined,
      basePrice: value.basePrice,
      maxOccupancy: value.maxOccupancy,
      amenityIds: value.amenityIds,
    };

    const call = this.roomType
      ? this.api.update(this.roomType.id, request)
      : this.api.create(request);

    call.subscribe({
      next: (saved) => {
        this.notify.success(`"${saved.name}" ${this.isEdit ? 'updated' : 'created'}`);
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        applyServerErrors(this.form, error);
      },
    });
  }
}
