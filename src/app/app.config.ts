import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    // Order matters: authInterceptor adds the token, errorInterceptor handles the response
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    // Date pickers: use JavaScript Date, shown as 2026/11/25
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
  ],
};
