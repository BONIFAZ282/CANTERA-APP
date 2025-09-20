import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Insumo } from '../models/insumo.model';

@Injectable({
  providedIn: 'root'
})
export class InsumoService {
  private baseUrl = 'http://localhost:8080/api/insumo';

  constructor(private http: HttpClient) {}

  listarInsumos(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(`${this.baseUrl}/listar`);
  }

  registrarInsumo(insumo: any): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/insertar`, insumo);
  }

  actualizarInsumo(insumo: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/modificar`, insumo);
  }

  eliminarInsumo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`);
  }
}