import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { AmenityRequest, AmenityResponse } from '../models';

/** Calls AmenityController (/api/amenities). */
@Injectable({ providedIn: 'root' })
export class AmenityService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/amenities`;

  findAll(): Observable<AmenityResponse[]> {
    return this.http.get<AmenityResponse[]>(this.url);
  }

  findById(id: number): Observable<AmenityResponse> {
    return this.http.get<AmenityResponse>(`${this.url}/${id}`);
  }

  create(request: AmenityRequest): Observable<AmenityResponse> {
    return this.http.post<AmenityResponse>(this.url, request);
  }

  update(id: number, request: AmenityRequest): Observable<AmenityResponse> {
    return this.http.put<AmenityResponse>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
