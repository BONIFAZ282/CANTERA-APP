import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaInsumo } from '../models/categoriaInsumo.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaInsumoService {
  private baseUrl = 'http://localhost:8080/api/categoriainsumo';

  constructor(private http: HttpClient) {}

  listarCategoriaInsumos(): Observable<CategoriaInsumo[]> {
    return this.http.get<CategoriaInsumo[]>(`${this.baseUrl}/listar`);
  }

  registrarCategoriaInsumo(categoria: any): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/insertar`, categoria);
  }

  actualizarCategoriaInsumo(categoria: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/modificar`, categoria);
  }

  eliminarCategoriaInsumo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`);
  }
}