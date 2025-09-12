import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private baseUrl = 'http://localhost:8080/api/producto';

  constructor(private http: HttpClient) {}

  listarProducto(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/listar`);
  }

  registrarProducto(producto: Producto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/insertar`, producto);
  }

  actualizarProducto(producto: Producto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/modificar`, producto);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`);
  }
}
