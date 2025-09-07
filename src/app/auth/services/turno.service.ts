import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Turno } from '../models/turno.model';

@Injectable({ 
    providedIn: 'root' 
})
export class TurnoService {
  private baseUrl = 'http://localhost:8080/api/turno';

  constructor(private http: HttpClient) {}

  listarTurnos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.baseUrl}/listar`);
  }

  registrarTurno(turno: Turno): Observable<any> {
    return this.http.post(`${this.baseUrl}/insertar`, turno);
  }

  actualizarTurno(turno: Turno): Observable<any> {
    return this.http.put(`${this.baseUrl}/modificar`, turno);
  }

  eliminarTurno(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminar/${id}`);
  }
}
