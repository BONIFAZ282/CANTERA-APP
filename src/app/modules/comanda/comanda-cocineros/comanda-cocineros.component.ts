import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { interval, Subscription } from 'rxjs';
import { CocinaService } from '../../../auth/services/cocina.service';
import { InventarioService } from '../../../auth/services/inventario.service';
import { DetallePedidoCocina, EstadisticasCocina, PedidoCocina } from '../../../auth/models/cocina.model';

interface ItemPedido {
  detalleId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Pedido {
  numero: number;
  tipo: 'Mesa' | 'Para Llevar' | 'Delivery';
  mesa?: string;
  cliente?: string;
  telefono?: string;
  direccion?: string;
  estado: 'Pendiente' | 'En Preparación' | 'Listo' | 'Entregado';
  hora: string;
  tiempoTranscurrido?: number;
  tiempoPreparacion?: number;
  tiempoEspera?: number;
  horaCompletado?: string;
  items: ItemPedido[];
  observaciones?: string;
  mozo?: string;
}

@Component({
  selector: 'app-comanda-cocineros',
  templateUrl: './comanda-cocineros.component.html',
  styleUrls: ['./comanda-cocineros.component.scss']
})
export class ComandaCocinerosComponent implements OnInit, OnDestroy {

  filtroTipo = 'Todos';

  // Datos reales del backend
  todosPedidos: Pedido[] = [];
  estadisticas: EstadisticasCocina = {
    pendientes: 0,
    enPreparacion: 0,
    listos: 0,
    totalHoy: 0,
    promedioTiempo: 0
  };

  // Subscriptions para cleanup
  private refreshSubscription?: Subscription;
  private timerSubscription?: Subscription;

  constructor(
    private cocinaService: CocinaService,
    private inventarioService: InventarioService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
    this.iniciarRefreshAutomatico();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
  }

  /**
   * Cargar todos los datos iniciales
   */
  cargarDatos(): void {
    this.cargarPedidos();
    this.cargarEstadisticas();
  }

  /**
   * Cargar pedidos desde el backend
   */
  cargarPedidos(): void {
    this.cocinaService.obtenerPedidosCocina().subscribe({
      next: (data) => {
        this.todosPedidos = this.procesarPedidosBackend(data);
        console.log('Pedidos cargados:', this.todosPedidos);
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los pedidos de cocina'
        });
      }
    });
  }

  /**
   * Cargar estadísticas desde el backend
   */
  cargarEstadisticas(): void {
    this.cocinaService.obtenerEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas = stats;
        console.log('Estadísticas cargadas:', stats);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  /**
   * Procesar pedidos del backend al formato del frontend
   */
  private procesarPedidosBackend(data: { [estado: string]: PedidoCocina[] }): Pedido[] {
    const pedidos: Pedido[] = [];

    // Procesar cada estado
    Object.keys(data).forEach(estado => {
      data[estado].forEach(pedidoBackend => {
        const pedido: Pedido = {
          numero: pedidoBackend.numero,
          tipo: this.determinarTipoPedido(pedidoBackend.mesa),
          mesa: pedidoBackend.mesa,
          estado: estado as 'Pendiente' | 'En Preparación' | 'Listo',
          hora: pedidoBackend.hora,
          tiempoTranscurrido: pedidoBackend.tiempoTranscurrido,
          observaciones: pedidoBackend.observaciones,
          mozo: pedidoBackend.mozo,
          items: [] // Se cargarán cuando sea necesario
        };

        // Configurar tiempo según estado
        if (estado === 'Pendiente') {
          pedido.tiempoTranscurrido = pedidoBackend.tiempoTranscurrido;
        } else if (estado === 'En Preparación') {
          pedido.tiempoPreparacion = pedidoBackend.tiempoTranscurrido;
        } else if (estado === 'Listo') {
          pedido.tiempoEspera = pedidoBackend.tiempoTranscurrido;
          pedido.horaCompletado = pedidoBackend.hora;
        }

        pedidos.push(pedido);
      });
    });

    return pedidos;
  }

  /**
   * Determinar tipo de pedido basado en la mesa
   */
  private determinarTipoPedido(mesa: string): 'Mesa' | 'Para Llevar' | 'Delivery' {
    if (mesa.toLowerCase().includes('mesa')) {
      return 'Mesa';
    } else if (mesa.toLowerCase().includes('llevar')) {
      return 'Para Llevar';
    } else if (mesa.toLowerCase().includes('delivery')) {
      return 'Delivery';
    }
    return 'Mesa'; // Por defecto
  }

  /**
   * Getters para filtrar pedidos
   */
  get pedidosPendientes(): Pedido[] {
    return this.todosPedidos.filter(p => p.estado === 'Pendiente');
  }

  get pedidosEnPreparacion(): Pedido[] {
    return this.todosPedidos.filter(p => p.estado === 'En Preparación');
  }

  get pedidosListos(): Pedido[] {
    return this.todosPedidos.filter(p => p.estado === 'Listo');
  }

  /**
   * Filtrar pedidos por estado y tipo
   */
  pedidosFiltrados(estado: string): Pedido[] {
    let pedidos = this.todosPedidos.filter(p => p.estado === estado);

    if (this.filtroTipo !== 'Todos') {
      pedidos = pedidos.filter(p => p.tipo === this.filtroTipo);
    }

    return pedidos.sort((a, b) => {
      const tiempoA = a.tiempoTranscurrido || a.tiempoPreparacion || 0;
      const tiempoB = b.tiempoTranscurrido || b.tiempoPreparacion || 0;
      return tiempoB - tiempoA; // Más urgente primero
    });
  }

  /**
   * Iniciar preparación de un pedido
   */
  iniciarPreparacion(pedido: Pedido): void {
    Swal.fire({
      title: '¿Iniciar preparación?',
      html: `
        <div style="text-align: left;">
          <p><strong>Pedido #${pedido.numero}</strong></p>
          <p><strong>Tipo:</strong> ${pedido.tipo}</p>
          ${pedido.mesa ? `<p><strong>Mesa:</strong> ${pedido.mesa}</p>` : ''}
          ${pedido.mozo ? `<p><strong>Mozo:</strong> ${pedido.mozo}</p>` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, iniciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoPedido(pedido.numero, 'En Preparación');
      }
    });
  }

  /**
   * Marcar pedido como listo
   */
  marcarListo(pedido: Pedido): void {
    Swal.fire({
      title: '¿Marcar como listo?',
      html: `
        <div style="text-align: left;">
          <p><strong>Pedido #${pedido.numero}</strong></p>
          <p>El pedido se marcará como listo para entregar</p>
          ${pedido.tipo === 'Mesa' ? '<p style="color: #059669;">💡 Notifica al mozo que el pedido está listo</p>' : ''}
          ${pedido.tipo === 'Para Llevar' ? '<p style="color: #059669;">💡 El cliente puede recoger su pedido</p>' : ''}
          ${pedido.tipo === 'Delivery' ? '<p style="color: #059669;">💡 El pedido está listo para delivery</p>' : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Marcar Listo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoPedido(pedido.numero, 'Listo');
      }
    });
  }

  /**
   * Pausar preparación
   */
  pausarPreparacion(pedido: Pedido): void {
    Swal.fire({
      title: 'Pausar preparación',
      text: `¿Regresar pedido #${pedido.numero} a pendientes?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, pausar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f59e0b'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoPedido(pedido.numero, 'Pendiente');
      }
    });
  }

  /**
   * Reabrir pedido
   */
  reabrir(pedido: Pedido): void {
    Swal.fire({
      title: 'Reabrir pedido',
      text: `¿Regresar pedido #${pedido.numero} a preparación?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reabrir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoPedido(pedido.numero, 'En Preparación');
      }
    });
  }


  marcarEntregado(pedido: Pedido): void {
    Swal.fire({
      title: 'Confirmar entrega',
      html: `
      <div style="text-align: left;">
        <p><strong>Pedido #${pedido.numero}</strong></p>
        <p>¿Confirmar que el pedido fue entregado?</p>
        <div style="background: #e7f3ff; padding: 12px; border-radius: 6px; margin: 10px 0;">
          <small style="color: #1976d2;">
            📦 Al confirmar se actualizará automáticamente el inventario
          </small>
        </div>
      </div>
    `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, entregar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarEntregaCompleta(pedido);
      }
    });
  }

  private procesarEntregaCompleta(pedido: Pedido): void {
    // Mostrar loading
    Swal.fire({
      title: 'Procesando entrega...',
      html: 'Actualizando estado del pedido e inventario',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Paso 1: Cambiar estado a Entregado
    this.cocinaService.cambiarEstadoPedido(pedido.numero, 'Entregado').subscribe({
      next: (response) => {
        if (response.success) {
          // Paso 2: Procesar inventario automáticamente
          this.procesarInventarioPedido(pedido.numero);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al entregar',
            text: response.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado del pedido'
        });
      }
    });
  }

  private procesarInventarioPedido(pedidoId: number): void {
    this.inventarioService.procesarSalidaInventarioPedido(pedidoId).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Pedido entregado correctamente',
            html: `
            <div style="text-align: left;">
              <p>✅ Estado actualizado a "Entregado"</p>
              <p>📦 Inventario actualizado automáticamente</p>
            </div>
          `,
            timer: 3000,
            timerProgressBar: true
          });

          // Recargar datos
          this.cargarDatos();
        } else {
          // El pedido se entregó pero hubo problema con inventario
          Swal.fire({
            icon: 'warning',
            title: 'Pedido entregado con advertencia',
            html: `
            <div style="text-align: left;">
              <p>✅ Pedido marcado como entregado</p>
              <p>⚠️ Problema con inventario: ${response.mensaje}</p>
              <p><small>Contacta al administrador para revisar el stock</small></p>
            </div>
          `,
            confirmButtonText: 'Entendido'
          });

          this.cargarDatos();
        }
      },
      error: (error) => {
        console.error('Error al procesar inventario:', error);

        Swal.fire({
          icon: 'warning',
          title: 'Pedido entregado - Error en inventario',
          html: `
          <div style="text-align: left;">
            <p>✅ El pedido se marcó como entregado</p>
            <p>❌ No se pudo actualizar el inventario</p>
            <p><small>Contacta al administrador para actualizar el stock manualmente</small></p>
          </div>
        `,
          confirmButtonText: 'Entendido'
        });

        this.cargarDatos();
      }
    });
  }


  private cambiarEstadoPedido(pedidoID: number, nuevoEstado: string): void {
    this.cocinaService.cambiarEstadoPedido(pedidoID, nuevoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            text: response.mensaje,
            timer: 2000,
            timerProgressBar: true
          });

          this.cargarDatos();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado del pedido'
        });
      }
    });
  }


  abrirDetallePedido(pedido: Pedido): void {
    this.cocinaService.obtenerDetallePedido(pedido.numero).subscribe({
      next: (response) => {
        this.mostrarDetallePedido(response.detallePedido);
      },
      error: (error) => {
        console.error('Error al obtener detalle:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el detalle del pedido'
        });
      }
    });
  }

  private mostrarDetallePedido(detalle: DetallePedidoCocina[]): void {
    if (detalle.length === 0) return;

    const pedidoInfo = detalle[0];
    const items = detalle;

    const itemsHtml = items.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
        <span>${item.cantidad}x ${item.nombreProducto}</span>
        <span>S/ ${item.subtotal.toFixed(2)}</span>
      </div>
    `).join('');

    Swal.fire({
      title: `Detalle Pedido #${pedidoInfo.numero}`,
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <div style="margin-bottom: 16px; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <p><strong>Mesa:</strong> ${pedidoInfo.mesa}</p>
            <p><strong>Mozo:</strong> ${pedidoInfo.mozo}</p>
            <p><strong>Personas:</strong> ${pedidoInfo.numeroPersonas}</p>
            <p><strong>Hora:</strong> ${pedidoInfo.hora}</p>
            <p><strong>Estado:</strong> <span style="color: ${this.getEstadoColor(pedidoInfo.estado)}">${pedidoInfo.estado}</span></p>
            <p><strong>Total:</strong> S/ ${pedidoInfo.total.toFixed(2)}</p>
          </div>
          
          <h4>Items del pedido:</h4>
          <div style="margin: 16px 0;">
            ${itemsHtml}
          </div>
          
          ${pedidoInfo.observaciones ? `
            <div style="margin-top: 16px; padding: 12px; background: #fff7ed; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <strong>Observaciones:</strong><br>
              ${pedidoInfo.observaciones}
            </div>
          ` : ''}
        </div>
      `,
      width: '600px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#4f46e5'
    });
  }

  /**
   * Configurar refresh automático
   */
  private iniciarRefreshAutomatico(): void {
    // Refrescar cada 30 segundos
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.cargarDatos();
    });
  }

  /**
   * Refrescar manualmente
   */
  refrescarPedidos(): void {
    this.cargarDatos();
    Swal.fire({
      icon: 'success',
      title: 'Actualizado',
      text: 'Pedidos actualizados correctamente',
      timer: 1500,
      timerProgressBar: true
    });
  }

  // Métodos auxiliares (mantener los existentes)
  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'Mesa': return 'restaurant';
      case 'Para Llevar': return 'takeout_dining';
      case 'Delivery': return 'delivery_dining';
      default: return 'help_outline';
    }
  }

  getTiempoClass(tiempo: number | undefined): string {
    const tiempoValido = tiempo || 0;
    if (tiempoValido < 10) return 'tiempo-normal';
    if (tiempoValido < 20) return 'tiempo-advertencia';
    return 'tiempo-urgente';
  }

  private getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pendiente': return '#f59e0b';
      case 'En Preparación': return '#3b82f6';
      case 'Listo': return '#059669';
      default: return '#6b7280';
    }
  }

  // Métodos dummy para compatibilidad (se pueden remover)
  actualizarProgreso(pedido: Pedido): void {
    // Ya no necesario sin tracking de items individuales
  }

  todoCompletado(pedido: Pedido): boolean {
    // Siempre true ya que no hay tracking individual
    return true;
  }



}