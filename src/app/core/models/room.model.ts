import { RoomStatus } from './enums';

export interface RoomRequest {
  roomNumber: string;
  floor: number;
  status?: RoomStatus;     // optional, defaults to AVAILABLE
  roomTypeId: number;
}

export interface RoomResponse {
  id: number;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  roomTypeId: number;
  roomTypeName: string;
  pricePerNight: number;
}

/** Query params for GET /api/rooms/available */
export interface AvailabilityQuery {
  checkIn: string;         // "YYYY-MM-DD"
  checkOut: string;        // "YYYY-MM-DD"
  guests: number;
}
