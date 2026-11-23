export interface GuestRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  address?: string;
}

export interface GuestResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  address: string | null;
  createdAt: string;       // ISO date-time, e.g. "2026-11-23T20:46:00"
}
