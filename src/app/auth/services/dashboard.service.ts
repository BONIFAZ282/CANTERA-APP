import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private API_URL = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) { }

  obtenerDatosDashboard(fecha?: string): Observable<DashboardData> {
    let params = new HttpParams();
    if (fecha) {
      params = params.set('fecha', fecha);
    }

    return this.http.get<DashboardData>(`${this.API_URL}/dashboard/datos`, { params });
  }
}
