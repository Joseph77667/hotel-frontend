import { StaffRole } from './enums';

export interface StaffRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: StaffRole;
}

export interface StaffResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: StaffRole;
  active: boolean;
}
