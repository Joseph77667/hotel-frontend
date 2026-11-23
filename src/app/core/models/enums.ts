/**
 * Same values as the Java enums in com.joseph.hotelJ.model.enums.
 * The arrays are handy for <mat-select> dropdowns.
 */

export const ROOM_STATUSES = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'ONLINE'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const STAFF_ROLES = ['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
