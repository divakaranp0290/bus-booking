import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusSearchResult } from '../models/bus-search.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private  API_BASE = '/api';

  constructor(private http: HttpClient) {}

 search(payload: {
  from: string;
  to: string;
  date: string;
}) {
  return this.http.post<any>(
    `${this.API_BASE}/bus/search`,
    payload
  );
}
}
