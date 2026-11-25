import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_URL } from '../config/api.config';
import { BalanceResponse, PaymentRequest, PaymentResponse } from '../models';

/** Calls PaymentController (/api/payments). */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/payments`;

  create(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.url, request);
  }

  findByReservation(reservationId: number): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.url}/reservation/${reservationId}`);
  }

  /** Amount still owed for a reservation. */
  getBalance(reservationId: number): Observable<number> {
    return this.http
      .get<BalanceResponse>(`${this.url}/reservation/${reservationId}/balance`)
      .pipe(map((response) => response.balance));
  }

  refund(id: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.url}/${id}/refund`, null);
  }
}
