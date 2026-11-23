import { StaffRole } from '../models';

/** Role groups shared by the routes and the sidebar menu (same rules as SecurityConfig). */
export const ALL_STAFF: StaffRole[] = ['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING'];
export const FRONT_DESK: StaffRole[] = ['ADMIN', 'RECEPTIONIST'];
export const ADMIN_ONLY: StaffRole[] = ['ADMIN'];
