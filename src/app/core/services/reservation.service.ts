import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  Page,
  PageParams,
  ReservationRequest,
  ReservationResponse,
  ReservationStatus,
} from '../models';

/** Calls ReservationController (/api/reservations). */
@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/reservations`;

  // ---------- Read ----------

  findAll(params: PageParams & { status?: ReservationStatus } = {}): Observable<Page<ReservationResponse>> {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    return this.http.get<Page<ReservationResponse>>(this.url, { params: httpParams });
  }

  findById(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.url}/${id}`);
  }

  findByCode(code: string): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.url}/code/${encodeURIComponent(code)}`);
  }

  findByGuest(guestId: number): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.url}/guest/${guestId}`);
  }

  todayArrivals(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.url}/arrivals/today`);
  }

  todayDepartures(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.url}/departures/today`);
  }

  // ---------- Create / update ----------

  create(request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.url, request);
  }

  update(id: number, request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${this.url}/${id}`, request);
  }

  // ---------- Status actions ----------

  confirm(id: number): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.url}/${id}/confirm`, null);
  }

  checkIn(id: number): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.url}/${id}/check-in`, null);
  }

  checkOut(id: number): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.url}/${id}/check-out`, null);
  }

  cancel(id: number): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.url}/${id}/cancel`, null);
  }
}
