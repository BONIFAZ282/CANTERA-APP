// header.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/AuthService';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  
  @Input() showMenuButton = false;
  @Output() toggleSidenav = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {}

  get nombreUsuario(): string {
    return this.authService.getUsername();
  }

  get estaAutenticado(): boolean {
    return this.authService.estaAutenticado();
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  cerrarSesion(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: `Hasta luego ${this.nombreUsuario}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    });
  }
}