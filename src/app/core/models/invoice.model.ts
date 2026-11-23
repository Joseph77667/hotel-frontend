export interface InvoiceResponse {
  id: number;
  invoiceNumber: string;   // "INV-202611-0001"
  issuedAt: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  reservationId: number;
  reservationCode: string;
  guestName: string;
}
