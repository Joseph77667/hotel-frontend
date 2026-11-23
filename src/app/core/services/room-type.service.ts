import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { RoomTypeRequest, RoomTypeResponse } from '../models';

/** Calls RoomTypeController (/api/room-types). */
@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/room-types`;

  /** All room types, cheapest first. Pass guests to get only types that fit. */
  findAll(guests?: number): Observable<RoomTypeResponse[]> {
    let params = new HttpParams();
    if (guests) {
      params = params.set('guests', guests);
    }
    return this.http.get<RoomTypeResponse[]>(this.url, { params });
  }

  findById(id: number): Observable<RoomTypeResponse> {
    return this.http.get<RoomTypeResponse>(`${this.url}/${id}`);
  }

  create(request: RoomTypeRequest): Observable<RoomTypeResponse> {
    return this.http.post<RoomTypeResponse>(this.url, request);
  }

  update(id: number, request: RoomTypeRequest): Observable<RoomTypeResponse> {
    return this.http.put<RoomTypeResponse>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
