import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ErrorResponse } from '../../core/models';

/**
 * Puts the backend's VALIDATION_FAILED fieldErrors onto the matching form controls:
 *   { "fieldErrors": { "email": "must be a well-formed email address" } }
 *   → form.controls.email gets error { server: "must be a well-formed email address" }
 *
 * The error disappears as soon as the user edits that field.
 */
export function applyServerErrors(form: FormGroup, error: HttpErrorResponse): void {
  const fieldErrors = (error.error as Partial<ErrorResponse> | null)?.fieldErrors;
  if (!fieldErrors) {
    return;
  }
  for (const [field, message] of Object.entries(fieldErrors)) {
    const control = form.get(field);
    if (control) {
      control.setErrors({ server: message });
      control.markAsTouched();
    }
  }
}

/** Message to show under a field, or null. Covers the common validators. */
export function errorMessage(control: AbstractControl, label: string): string | null {
  if (!control.errors || !control.touched) {
    return null;
  }
  const errors = control.errors;
  if (errors['required']) return `${label} is required`;
  if (errors['email']) return 'Enter a valid email address';
  if (errors['min']) return `${label} must be at least ${errors['min'].min}`;
  if (errors['max']) return `${label} must be at most ${errors['max'].max}`;
  if (errors['minlength']) return `${label} must be at least ${errors['minlength'].requiredLength} characters`;
  if (errors['maxlength']) return `${label} must be at most ${errors['maxlength'].requiredLength} characters`;
  if (errors['server']) return errors['server'] as string;
  return `${label} is invalid`;
}
