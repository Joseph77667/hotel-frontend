import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { InvoiceResponse } from '../models';

/** Calls InvoiceController (/api/invoices). Invoices are created by the backend at check-out. */
@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/invoices`;

  findById(id: number): Observable<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(`${this.url}/${id}`);
  }

  findByReservation(reservationId: number): Observable<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(`${this.url}/reservation/${reservationId}`);
  }

  /** Dates as "YYYY-MM-DD", both included. */
  findIssuedBetween(from: string, to: string): Observable<InvoiceResponse[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<InvoiceResponse[]>(this.url, { params });
  }
}
