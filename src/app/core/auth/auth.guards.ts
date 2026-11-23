import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { StaffRole } from '../models';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from './auth.service';

/** Page needs a logged-in user. Otherwise → /login?returnUrl=<where they wanted to go> */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/**
 * Page needs one of the roles in route data, e.g.
 *   { path: 'staff', data: { roles: ['ADMIN'] }, ... }
 * Only hides pages in the browser — the backend still checks every API call.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  const roles = (route.data['roles'] ?? []) as StaffRole[];
  if (roles.length === 0 || auth.hasRole(...roles)) {
    return true;
  }
  notify.error('You do not have access to that page.');
  return router.createUrlTree(['/dashboard']);
};

/** Login page: if already logged in, go straight to the dashboard. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.createUrlTree(['/dashboard']) : true;
};
