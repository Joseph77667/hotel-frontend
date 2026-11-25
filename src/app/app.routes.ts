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
      {
        path: 'reservations',
        title: 'Reservations | HotelJ',
        data: { roles: FRONT_DESK },
        loadComponent: () =>
          import('./features/reservations/reservation-list/reservation-list.component').then(
            (m) => m.ReservationListComponent,
          ),
      },
      {
        // Must come before 'reservations/:id', otherwise "new" would be read as an id
        path: 'reservations/new',
        title: 'New booking | HotelJ',
        data: { roles: FRONT_DESK },
        loadComponent: () =>
          import('./features/reservations/new-reservation/new-reservation.component').then(
            (m) => m.NewReservationComponent,
          ),
      },
      {
        path: 'reservations/:id',
        title: 'Reservation | HotelJ',
        data: { roles: FRONT_DESK },
        loadComponent: () =>
          import('./features/reservations/reservation-detail/reservation-detail.component').then(
            (m) => m.ReservationDetailComponent,
          ),
      },
      {
        path: 'guests',
        title: 'Guests | HotelJ',
        data: { roles: FRONT_DESK },
        loadComponent: () =>
          import('./features/guests/guest-list/guest-list.component').then((m) => m.GuestListComponent),
      },
      {
        path: 'guests/:id',
        title: 'Guest | HotelJ',
        data: { roles: FRONT_DESK },
        loadComponent: () =>
          import('./features/guests/guest-detail/guest-detail.component').then((m) => m.GuestDetailComponent),
      },
      {
        path: 'rooms',
        title: 'Room Board | HotelJ',
        data: { roles: ALL_STAFF },
        loadComponent: () =>
          import('./features/rooms/room-board/room-board.component').then((m) => m.RoomBoardComponent),
      },
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
