import { AmenityResponse } from './amenity.model';

export interface RoomTypeRequest {
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  amenityIds: number[];
}

export interface RoomTypeResponse {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;       // price per night (yen, tax included)
  maxOccupancy: number;
  amenities: AmenityResponse[];
}
