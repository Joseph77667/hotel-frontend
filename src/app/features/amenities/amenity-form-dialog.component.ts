import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AmenityRequest, AmenityResponse } from '../../core/models';
import { NotificationService } from '../../core/notification/notification.service';
import { AmenityService } from '../../core/services/amenity.service';
import { applyServerErrors, errorMessage } from '../../shared/utils/form-errors';

/**
 * Create / edit dialog.
 * Opened with data = null (create) or an existing amenity (edit).
 * Closes with true when saved, so the list knows to reload.
 */
@Component({
  selector: 'app-amenity-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './amenity-form-dialog.component.html',
})
export class AmenityFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(AmenityService);
  private readonly notify = inject(NotificationService);
  private readonly dialogRef = inject<MatDialogRef<AmenityFormDialogComponent, boolean>>(MatDialogRef);

  readonly amenity = inject<AmenityResponse | null>(MAT_DIALOG_DATA);
  readonly isEdit = this.amenity !== null;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    name: [this.amenity?.name ?? '', [Validators.required, Validators.maxLength(50)]],
    description: [this.amenity?.description ?? '', Validators.maxLength(255)],
  });

  error(field: 'name' | 'description', label: string): string | null {
    return errorMessage(this.form.controls[field], label);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    const value = this.form.getRawValue();
    const request: AmenityRequest = {
      name: value.name.trim(),
      description: value.description.trim() || undefined,
    };

    const call = this.amenity
      ? this.api.update(this.amenity.id, request)
      : this.api.create(request);

    call.subscribe({
      next: (saved) => {
        this.notify.success(`"${saved.name}" ${this.isEdit ? 'updated' : 'created'}`);
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        applyServerErrors(this.form, error);   // 409 duplicate is shown by the error interceptor
      },
    });
  }
}
