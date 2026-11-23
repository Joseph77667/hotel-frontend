import { Routes } from '@angular/router';

import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
import { ADMIN_ONLY, ALL_STAFF, FRONT_DESK } from './core/auth/roles';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

/** Temporary page until each feature is built. */
const comingSoon = () =>
  import('./shared/components/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent);

export const routes: Routes = [
  // ----- Public -----
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Login | HotelJ',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },

  // ----- Logged-in area: every child uses the sidebar layout -----
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [roleGuard],      // checks data.roles on each child below
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard | HotelJ',
        data: { roles: ALL_STAFF },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      { path: 'reservations', title: 'Reservations | HotelJ', data: { roles: FRONT_DESK, title: 'Reservations' }, loadComponent: comingSoon },
      { path: 'guests', title: 'Guests | HotelJ', data: { roles: FRONT_DESK, title: 'Guests' }, loadComponent: comingSoon },
      { path: 'rooms', title: 'Room Board | HotelJ', data: { roles: ALL_STAFF, title: 'Room Board' }, loadComponent: comingSoon },
      { path: 'invoices', title: 'Invoices | HotelJ', data: { roles: FRONT_DESK, title: 'Invoices' }, loadComponent: comingSoon },
      {
        path: 'settings/room-types',
        title: 'Room Types | HotelJ',
        data: { roles: ADMIN_ONLY },
        loadComponent: () =>
          import('./features/room-types/room-type-list/room-type-list.component').then((m) => m.RoomTypeListComponent),
      },
      {
        path: 'settings/amenities',
        title: 'Amenities | HotelJ',
        data: { roles: ADMIN_ONLY },
        loadComponent: () =>
          import('./features/amenities/amenity-list/amenity-list.component').then((m) => m.AmenityListComponent),
      },
      { path: 'staff', title: 'Staff | HotelJ', data: { roles: ADMIN_ONLY, title: 'Staff' }, loadComponent: comingSoon },
    ],
  },

  // Unknown URL → dashboard (or login if not logged in)
  { path: '**', redirectTo: 'dashboard' },
];
