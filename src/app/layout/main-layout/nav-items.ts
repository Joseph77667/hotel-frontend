import { ADMIN_ONLY, ALL_STAFF, FRONT_DESK } from '../../core/auth/roles';
import { StaffRole } from '../../core/models';

export interface NavItem {
  label: string;
  icon: string;          // Material icon name: https://fonts.google.com/icons
  route: string;
  roles: StaffRole[];
}

/** Sidebar menu. Each role only sees the items it is allowed to use. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ALL_STAFF },
  { label: 'Reservations', icon: 'event_note', route: '/reservations', roles: FRONT_DESK },
  { label: 'Guests', icon: 'people', route: '/guests', roles: FRONT_DESK },
  { label: 'Room Board', icon: 'meeting_room', route: '/rooms', roles: ALL_STAFF },
  { label: 'Invoices', icon: 'receipt_long', route: '/invoices', roles: FRONT_DESK },
  { label: 'Room Types', icon: 'king_bed', route: '/settings/room-types', roles: ADMIN_ONLY },
  { label: 'Amenities', icon: 'wifi', route: '/settings/amenities', roles: ADMIN_ONLY },
  { label: 'Staff', icon: 'badge', route: '/staff', roles: ADMIN_ONLY },
];
