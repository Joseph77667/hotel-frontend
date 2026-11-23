import { PaymentMethod, PaymentStatus } from './enums';

export interface PaymentRequest {
  reservationId: number;
  amount: number;
  method: PaymentMethod;
  transactionReference?: string;
}

export interface PaymentResponse {
  id: number;
  reservationId: number;
  reservationCode: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  transactionReference: string | null;
  receivedByStaffName: string | null;
}

/** GET /api/payments/reservation/{id}/balance */
export interface BalanceResponse {
  reservationId: number;
  balance: number;
}
