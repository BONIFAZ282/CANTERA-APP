import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/AuthService';
import { MesaService } from '../../../auth/services/mesa.service';
import { Mesa } from '../../../auth/models/mesa.model';

@Component({
  selector: 'app-comanda-mozos',
  templateUrl: './comanda-mozos.component.html',
  styleUrls: ['./comanda-mozos.component.scss']
})

export class ComandaMozosComponent {

  filtroEstado = 'Todos';
  busqueda = '';
  usuarioActual: any = null;
  mesas: Mesa[] = [];
  mesaSeleccionada: Mesa | null = null;
  cargandoMesas = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private mesaService: MesaService
  ) { }

  ngOnInit(): void {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarUsuarioActual();
    this.cargarMesas();
  }

  cargarUsuarioActual(): void {
    this.usuarioActual = {
      id: 1,
      nombre: this.authService.getUsername(),
      cargo: this.authService.getCargoCod()
    };

  }


  mesasFiltradas(): Mesa[] {
    return this.mesas.filter(mesa => {
      const coincideBusqueda = mesa.tableCode.toLowerCase().includes(this.busqueda.toLowerCase());
      const estadoMesa = this.getEstadoMesa(mesa);
      const coincideEstado = this.filtroEstado === 'Todos' ||
        (this.filtroEstado === 'Disponible' && estadoMesa === 'Disponible') ||
        (this.filtroEstado === 'Ocupado' && estadoMesa === 'Ocupado');
      return coincideBusqueda && coincideEstado;
    });
  }

  cargarMesas(): void {
    this.cargandoMesas = true;
    this.mesaService.listarMesa().subscribe({
      next: (mesas) => {
        this.mesas = mesas;
        this.cargandoMesas = false;
      },
      error: (error) => {
        console.error('Error cargando mesas:', error);
        this.cargandoMesas = false;
        Swal.fire('Error', 'No se pudieron cargar las mesas', 'error');
      }
    });
  }

  getEstadoMesa(mesa: Mesa | null): string {
    if (!mesa || mesa.tableBusy === null || mesa.tableBusy === undefined) {
      return 'Disponible';
    }

    if (mesa.tableBusy === true) {
      return 'Ocupado';
    } else if (mesa.tableBusy === false) {
      return 'Disponible';
    } else {
      return 'Reservado';
    }
  }

  puedeGestionarMesa(mesa: Mesa | null): boolean {
    if (!mesa || !this.usuarioActual) {
      return false;
    }

    if (this.getEstadoMesa(mesa) === 'Disponible') {
      return true;
    }
    return mesa.username === this.usuarioActual.nombre;
  }

  abrirPedido(mesa: Mesa): void {
    if (!mesa) {
      return;
    }

    if (this.getEstadoMesa(mesa) === 'Disponible') {
      this.router.navigate(['/comanda/pedido', mesa.tableCode]);
    } else if (!this.puedeGestionarMesa(mesa)) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        html: `
        <div style="text-align: center; margin: 1rem 0;">
          <p><strong>${mesa.tableCode}</strong> está siendo atendida por:</p>
          <p style="color: #dc2626; font-weight: 600;">${mesa.username}</p>
          <p style="font-size: 0.9rem; color: #6b7280;">Solo el mozo asignado puede gestionar esta mesa</p>
        </div>
      `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#4f46e5'
      });
    }
  }

  abrirMenuMesa(mesa: Mesa, event: Event): void {
    event.stopPropagation();
    this.mesaSeleccionada = mesa;
  }

  cerrarMesa(mesa: Mesa | null): void {
    if (!mesa) {
      console.error('Mesa es null');
      return;
    }

    if (this.getEstadoMesa(mesa) === 'Disponible') {
      Swal.fire({
        icon: 'info',
        title: 'Mesa disponible',
        text: 'Esta mesa ya está disponible',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    if (mesa.username !== this.usuarioActual?.nombre) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: `Solo ${mesa.username} puede cerrar esta mesa`,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    Swal.fire({
      title: '¿Cerrar mesa?',
      html: `
        <div style="text-align: left; margin: 1rem 0;">
          <p>¿Está seguro que desea cerrar <strong>${mesa.tableCode}</strong>?</p>
          <p style="color: #dc2626; font-size: 0.9rem;">Esta acción liberará la mesa y eliminará el pedido actual.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar mesa',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed && mesa) {
        this.liberarMesa(mesa);
      }
    });
  }

  private liberarMesa(mesa: Mesa): void {

    this.mesaService.actualizarMesaDesocupada(mesa.tableCode).subscribe({
      next: () => {

        mesa.tableBusy = false;
        mesa.username = '';

        Swal.fire({
          icon: 'success',
          title: 'Mesa liberada',
          text: `${mesa.tableCode} está ahora disponible`,
          timer: 2000,
          timerProgressBar: true,
          confirmButtonColor: '#4f46e5'
        });
      },
      error: (error) => {
        console.error('❌ Error al liberar mesa:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo liberar la mesa. Intente nuevamente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#4f46e5'
        });
      }
    });
  }

  verPedido(mesa: Mesa): void {
    if (!mesa.pedidoID) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin pedido',
        text: 'Esta mesa no tiene un pedido activo'
      });
      return;
    }

    this.router.navigate(['/comanda/pedido', mesa.tableCode, 'editar', mesa.pedidoID]);
  }

  refrescarMesas(): void {
    this.cargarMesas();
  }

  cobrarPedido(mesa: Mesa): void {
    if (!mesa.pedidoID || mesa.pedidoID <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin pedido',
        text: 'Esta mesa no tiene un pedido activo para cobrar'
      });
      return;
    }

    console.log(mesa.pedidoID)
    this.router.navigate(['/comanda/cobrar', mesa.pedidoID], {
      queryParams: {
        mesa: mesa.tableCode,
        mozo: mesa.username
      }
    });
  }
}