import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mesa } from '../models/mesa.model';

@Injectable({
  providedIn: 'root'
})
export class MesaService {

  private baseUrl = 'http://localhost:8080/api/mesa';

  constructor(private http: HttpClient) { }

  listarMesa(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(`${this.baseUrl}/listar`);
  }

  registrarMesa(Mesa: Mesa): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/insertar`, Mesa);
  }

  actualizarMesa(Mesa: Mesa): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/modificar`, Mesa);
  }

  eliminarMesa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`);
  }

  actualizarMesaOcupada(tableCode: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/mesaocupada`, { tableCode });
  }
}
