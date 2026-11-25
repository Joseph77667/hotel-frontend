import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { GuestRequest, GuestResponse } from '../../../core/models';
import { NotificationService } from '../../../core/notification/notification.service';
import { GuestService } from '../../../core/services/guest.service';
import { applyServerErrors, errorMessage } from '../../../shared/utils/form-errors';

type Field = 'firstName' | 'lastName' | 'email' | 'phone' | 'nationality' | 'address';

/**
 * Create / edit a guest.
 * Closes with the saved GuestResponse (or undefined if cancelled),
 * so the caller can use the new guest straight away — e.g. in the booking wizard.
 */
@Component({
  selector: 'app-guest-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './guest-form-dialog.component.html',
  styleUrl: './guest-form-dialog.component.css',
})
export class GuestFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(GuestService);
  private readonly notify = inject(NotificationService);
  private readonly dialogRef = inject<MatDialogRef<GuestFormDialogComponent, GuestResponse>>(MatDialogRef);

  readonly guest = inject<GuestResponse | null>(MAT_DIALOG_DATA);
  readonly isEdit = this.guest !== null;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    firstName: [this.guest?.firstName ?? '', [Validators.required, Validators.maxLength(50)]],
    lastName: [this.guest?.lastName ?? '', [Validators.required, Validators.maxLength(50)]],
    email: [this.guest?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(100)]],
    phone: [this.guest?.phone ?? '', Validators.maxLength(20)],
    nationality: [this.guest?.nationality ?? '', Validators.maxLength(50)],
    address: [this.guest?.address ?? '', Validators.maxLength(255)],
  });

  error(field: Field, label: string): string | null {
    return errorMessage(this.form.controls[field], label);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    const v = this.form.getRawValue();
    const request: GuestRequest = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim(),
      phone: v.phone.trim() || undefined,
      nationality: v.nationality.trim() || undefined,
      address: v.address.trim() || undefined,
    };

    const call = this.guest ? this.api.update(this.guest.id, request) : this.api.create(request);

    call.subscribe({
      next: (saved) => {
        this.notify.success(`${saved.firstName} ${saved.lastName} ${this.isEdit ? 'updated' : 'added'}`);
        this.dialogRef.close(saved);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        applyServerErrors(this.form, error);   // 409 duplicate email → pop-up from the interceptor
      },
    });
  }
}
