import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { AvailabilityQuery, RoomRequest, RoomResponse, RoomStatus } from '../models';

/** Calls RoomController (/api/rooms). */
@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/rooms`;

  /** All rooms, or filtered by status or room type. */
  findAll(filter: { status?: RoomStatus; roomTypeId?: number } = {}): Observable<RoomResponse[]> {
    let params = new HttpParams();
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.roomTypeId) {
      params = params.set('roomTypeId', filter.roomTypeId);
    }
    return this.http.get<RoomResponse[]>(this.url, { params });
  }

  findById(id: number): Observable<RoomResponse> {
    return this.http.get<RoomResponse>(`${this.url}/${id}`);
  }

  /** Free rooms for a stay: GET /api/rooms/available?checkIn=&checkOut=&guests= */
  findAvailable(query: AvailabilityQuery): Observable<RoomResponse[]> {
    const params = new HttpParams()
      .set('checkIn', query.checkIn)
      .set('checkOut', query.checkOut)
      .set('guests', query.guests);
    return this.http.get<RoomResponse[]>(`${this.url}/available`, { params });
  }

  create(request: RoomRequest): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(this.url, request);
  }

  update(id: number, request: RoomRequest): Observable<RoomResponse> {
    return this.http.put<RoomResponse>(`${this.url}/${id}`, request);
  }

  /** PATCH /api/rooms/{id}/status?status=CLEANING */
  updateStatus(id: number, status: RoomStatus): Observable<RoomResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<RoomResponse>(`${this.url}/${id}/status`, null, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
