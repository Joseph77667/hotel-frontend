import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { PAYMENT_METHODS, PaymentMethod } from '../../../core/models';
import { NotificationService } from '../../../core/notification/notification.service';
import { PaymentService } from '../../../core/services/payment.service';
import { YenPipe } from '../../../shared/pipes/yen.pipe';
import { errorMessage } from '../../../shared/utils/form-errors';
import { toLabel } from '../../../shared/utils/labels';

export interface PaymentDialogData {
  reservationId: number;
  reservationCode: string;
  balance: number;
}

/** Take a payment. The amount starts at the full balance; it can't be more. */
@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, YenPipe],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.css',
})
export class PaymentDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(PaymentService);
  private readonly notify = inject(NotificationService);
  private readonly dialogRef = inject<MatDialogRef<PaymentDialogComponent, boolean>>(MatDialogRef);

  readonly data = inject<PaymentDialogData>(MAT_DIALOG_DATA);
  readonly methods = PAYMENT_METHODS;
  readonly toLabel = toLabel;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    amount: [this.data.balance, [Validators.required, Validators.min(1), Validators.max(this.data.balance)]],
    method: this.fb.control<PaymentMethod>('CASH', Validators.required),
    transactionReference: ['', Validators.maxLength(100)],
  });

  amountError(): string | null {
    return errorMessage(this.form.controls.amount, 'Amount');
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    const value = this.form.getRawValue();
    this.api
      .create({
        reservationId: this.data.reservationId,
        amount: value.amount,
        method: value.method,
        transactionReference: value.transactionReference.trim() || undefined,
      })
      .subscribe({
        next: (payment) => {
          this.notify.success(`Payment of ¥${payment.amount.toLocaleString()} received`);
          this.dialogRef.close(true);
        },
        error: () => this.saving.set(false),
      });
  }
}
