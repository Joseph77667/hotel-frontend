import { StaffResponse } from './staff.model';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;       // seconds
  staff: StaffResponse;
}
