import { ReservationStatus } from './enums';
import { PaymentResponse } from './payment.model';

export interface ReservationRequest {
  guestId: number;
  roomId: number;
  checkInDate: string;     // "YYYY-MM-DD"
  checkOutDate: string;    // "YYYY-MM-DD"
  numberOfGuests: number;
  specialRequests?: string;
}

export interface ReservationStatusRequest {
  status: ReservationStatus;
}

export interface ReservationResponse {
  id: number;
  reservationCode: string;          // "HTL-20261123-0001"

  guestId: number;
  guestName: string;

  roomId: number;
  roomNumber: string;
  roomTypeName: string;

  checkInDate: string;
  checkOutDate: string;
  nights: number;
  numberOfGuests: number;
  totalAmount: number;
  status: ReservationStatus;
  specialRequests: string | null;

  createdByStaffName: string | null;
  payments: PaymentResponse[];
  invoiceNumber: string | null;     // set after check-out
  createdAt: string;
}
