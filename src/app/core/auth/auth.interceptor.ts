import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_URL } from '../config/api.config';
import { AuthService } from './auth.service';

/**
 * Adds "Authorization: Bearer <token>" to every call to our API,
 * so no service has to do it by hand.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();

  const isApiCall = req.url.startsWith(API_URL);
  const isLoginCall = req.url.endsWith('/auth/login');

  if (!token || !isApiCall || isLoginCall) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
