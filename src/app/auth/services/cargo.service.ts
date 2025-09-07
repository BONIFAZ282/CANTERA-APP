import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cargo } from '../models/cargo.model';


@Injectable({
  providedIn: 'root'
})
export class CargoService {

  private baseUrl = 'http://localhost:8080/api/cargo';

  constructor(private http: HttpClient) {}

  listarCargos(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(`${this.baseUrl}/listar`);
  }

  registrarCargo(cargo: Cargo): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/insertar`, cargo);
  }

  actualizarCargo(cargo: Cargo): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/modificar`, cargo);
  }

  eliminarCargo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`);
  }
}
