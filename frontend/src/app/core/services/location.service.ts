import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { City } from '../models/city.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  constructor(private http: HttpClient) {}

  getCities() {
    return this.http.get<{ success: boolean; data: City[] }>(
      '/api/cities'
    );
  }
}
