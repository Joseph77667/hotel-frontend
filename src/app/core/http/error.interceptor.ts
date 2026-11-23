import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { ErrorResponse } from '../models';
import { NotificationService } from '../notification/notification.service';

/**
 * One place that reacts to every API error.
 * Uses the ErrorResponse JSON from the backend's GlobalExceptionHandler.
 *
 *   0       → backend not running
 *   401     → token missing/expired → log out, go to /login
 *   403     → wrong role
 *   400/404/409 → show the backend's message
 *                 (except VALIDATION_FAILED: the form shows those next to each field)
 *   500+    → generic message
 *
 * The error is always passed on, so a component can still react to it.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginCall = req.url.endsWith('/auth/login');
      const body = error.error as Partial<ErrorResponse> | null;

      if (error.status === 0) {
        notify.error('Cannot reach the server. Is the backend running?');
      } else if (error.status === 401 && !isLoginCall) {
        auth.logout(false);
        notify.error('Your session has expired. Please log in again.');
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      } else if (error.status === 403) {
        notify.error(body?.message ?? 'You do not have permission to do this.');
      } else if (error.status >= 500) {
        notify.error('Server error. Please try again later.');
      } else if (!isLoginCall && body?.message && body.code !== 'VALIDATION_FAILED') {
        notify.error(body.message);
      }

      return throwError(() => error);
    }),
  );
};
