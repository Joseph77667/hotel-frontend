import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { LoginRequest, LoginResponse, StaffResponse, StaffRole } from '../models';
import { NotificationService } from '../notification/notification.service';

const TOKEN_KEY = 'hotelj.token';
const USER_KEY = 'hotelj.user';

/**
 * Keeps track of who is logged in.
 *
 * - The JWT and the staff info are saved in localStorage, so a page refresh
 *   doesn't log you out.
 * - currentUser is a signal: any component that reads it updates automatically.
 * - When the token's "exp" time is reached, the user is logged out.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  private readonly user = signal<StaffResponse | null>(null);

  /** The logged-in staff member, or null. Read it like a function: currentUser() */
  readonly currentUser = this.user.asReadonly();
  readonly isLoggedIn = computed(() => this.user() !== null);
  readonly role = computed<StaffRole | null>(() => this.user()?.role ?? null);

  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.restoreSession();
  }

  /** POST /api/auth/login, then saves the token and user. */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/auth/login`, request)
      .pipe(tap((response) => this.startSession(response.accessToken, response.staff)));
  }

  /** Clears everything. redirect = false when we only want to clean up. */
  logout(redirect = true): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.clearTimer();
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** hasRole('ADMIN') or hasRole('ADMIN', 'RECEPTIONIST') */
  hasRole(...roles: StaffRole[]): boolean {
    const current = this.role();
    return current !== null && roles.includes(current);
  }

  // ---------------------------------------------------------------------------

  private startSession(token: string, staff: StaffResponse): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(staff));
    this.user.set(staff);
    this.scheduleAutoLogout(token);
  }

  /** Runs once when the app starts: was someone already logged in? */
  private restoreSession(): void {
    const token = this.getToken();
    const savedUser = localStorage.getItem(USER_KEY);
    if (!token || !savedUser) {
      return;
    }
    if (this.isExpired(token)) {
      this.logout(false);
      return;
    }
    try {
      this.user.set(JSON.parse(savedUser) as StaffResponse);
      this.scheduleAutoLogout(token);
    } catch {
      this.logout(false);
    }
  }

  private scheduleAutoLogout(token: string): void {
    this.clearTimer();
    const expiresAt = this.getExpiry(token);
    if (expiresAt === null) {
      return;
    }
    this.logoutTimer = setTimeout(() => {
      this.logout();
      this.notify.error('Your session has expired. Please log in again.');
    }, expiresAt - Date.now());
  }

  private clearTimer(): void {
    if (this.logoutTimer !== null) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private isExpired(token: string): boolean {
    const expiresAt = this.getExpiry(token);
    return expiresAt === null || expiresAt <= Date.now();
  }

  /**
   * Reads "exp" from the token payload (the middle part of header.payload.signature).
   * This is only for the UI timer: the real check always happens on the server.
   */
  private getExpiry(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const exp = (JSON.parse(json) as { exp?: unknown }).exp;
      return typeof exp === 'number' ? exp * 1000 : null;
    } catch {
      return null;
    }
  }
}
