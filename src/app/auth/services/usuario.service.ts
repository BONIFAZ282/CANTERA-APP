import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl = 'http://localhost:8080/api/usuario/verificar'; // Tu endpoint de verificación de usuario

  constructor(private http: HttpClient) { }

  verificarUsuario(username: string, password: string): Observable<Usuario> {
    const body = { username, password };
    return this.http.post<Usuario>(this.baseUrl, body);
  }
}
