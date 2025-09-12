import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../../auth/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(null);
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor() {
    // Cargar usuario desde localStorage al inicializar
    this.cargarUsuarioDesdeStorage();
  }

  // Guardar usuario después del login exitoso
  guardarUsuario(usuario: Usuario): void {
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    this.usuarioActualSubject.next(usuario);
  }

  // Cargar usuario desde localStorage
  private cargarUsuarioDesdeStorage(): void {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      this.usuarioActualSubject.next(usuario);
    }
  }

  // Obtener usuario actual
  get usuarioActual(): Usuario | null {
    return this.usuarioActualSubject.value;
  }

  // Verificar si está autenticado
  estaAutenticado(): boolean {
    return this.usuarioActual !== null;
  }

  // Obtener username
  getUsername(): string {
    return this.usuarioActual?.username || '';
  }

  // Obtener código de cargo
  getCargoCod(): string {
    return this.usuarioActual?.cargoCod || '';
  }

  // Verificar si tiene un cargo específico
  tieneCargo(cargoCod: string): boolean {
    return this.getCargoCod() === cargoCod;
  }

  // Verificar si es administrador
  esAdministrador(): boolean {
    return this.tieneCargo('00002'); // Ajusta según tu sistema
  }

  // Verificar si es mozo
  esMozo(): boolean {
    return this.tieneCargo('00001'); // Ajusta según tu sistema
  }

  // Cerrar sesión
  cerrarSesion(): void {
    localStorage.removeItem('usuarioActual');
    this.usuarioActualSubject.next(null);
  }

  // Obtener datos completos del usuario
  getDatosUsuario(): Usuario | null {
    return this.usuarioActual;
  }
}