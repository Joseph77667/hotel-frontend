import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { GuestRequest, GuestResponse, Page, PageParams } from '../models';

export interface GuestSearchParams extends PageParams {
  keyword?: string;
}

/** Calls GuestController (/api/guests). */
@Injectable({ providedIn: 'root' })
export class GuestService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/guests`;

  /** GET /api/guests?keyword=&page=&size=&sort= → one page of guests */
  findAll(search: GuestSearchParams = {}): Observable<Page<GuestResponse>> {
    let params = new HttpParams();
    if (search.keyword) params = params.set('keyword', search.keyword);
    if (search.page !== undefined) params = params.set('page', search.page);
    if (search.size !== undefined) params = params.set('size', search.size);
    if (search.sort) params = params.set('sort', search.sort);
    return this.http.get<Page<GuestResponse>>(this.url, { params });
  }

  findById(id: number): Observable<GuestResponse> {
    return this.http.get<GuestResponse>(`${this.url}/${id}`);
  }

  create(request: GuestRequest): Observable<GuestResponse> {
    return this.http.post<GuestResponse>(this.url, request);
  }

  update(id: number, request: GuestRequest): Observable<GuestResponse> {
    return this.http.put<GuestResponse>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
