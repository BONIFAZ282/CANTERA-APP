import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriService {

  private baseUrl = 'http://localhost:8080/api/categoriaproducto';

  constructor(private http: HttpClient) {}

  listarCategoria(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/listar`);
  }

  registrarCategoria(categoria: Categoria): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/insertar`, categoria);
  }

  actualizarCategoria(categoria: Categoria): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/modificar`, categoria);
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`);
  }
}
