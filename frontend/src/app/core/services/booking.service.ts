import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BusService {
  constructor(private http: HttpClient) {}

  search(payload: any) {
    return this.http.post<any>(
      '/api/bus/search',
      payload
    );
  }
}
