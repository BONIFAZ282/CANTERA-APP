import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface DetalleOrden {
  id: number;
  nInsumoId: number;
  nombreInsumo: string;
  nCantidad: number;
  nPrecioUnitario: number;
  subtotal: number;
}

interface OrdenCompra {
  id: number;
  nProveedorId: number;
  nombreProveedor: string;
  dFecha: Date;
  nTotal: number;
  nEstado: string;
  detalles: DetalleOrden[];
}

@Component({
  selector: 'app-ordenes-compra-listar',
  templateUrl: './ordenes-compra-listar.component.html',
  styleUrls: ['./ordenes-compra-listar.component.scss']
})
export class OrdenesCompraListarComponent implements OnInit {

  ordenesCompra: OrdenCompra[] = [];
  estadosDisponibles: string[] = ['Pendiente', 'Aprobada', 'Enviada', 'Recibida', 'Cancelada'];
  mostrarModal: boolean = false;
  ordenSeleccionada: OrdenCompra | null = null
  // Datos de ejemplo en duro
  proveedoresMock = [
    { id: 1, nombre: 'Proveedor A' },
    { id: 2, nombre: 'Proveedor B' },
    { id: 3, nombre: 'Proveedor C' }
  ];

  insumosMock = [
    { id: 1, nombre: 'Harina' },
    { id: 2, nombre: 'Azúcar' },
    { id: 3, nombre: 'Aceite' },
    { id: 4, nombre: 'Sal' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.cargarDatosMock();
  }

  cargarDatosMock(): void {
    this.ordenesCompra = [
      {
        id: 1,
        nProveedorId: 1,
        nombreProveedor: 'Proveedor A',
        dFecha: new Date('2024-01-15'),
        nTotal: 1250.50,
        nEstado: 'Pendiente',
        detalles: [
          {
            id: 1,
            nInsumoId: 1,
            nombreInsumo: 'Harina',
            nCantidad: 50,
            nPrecioUnitario: 15.00,
            subtotal: 750.00
          },
          {
            id: 2,
            nInsumoId: 2,
            nombreInsumo: 'Azúcar',
            nCantidad: 25,
            nPrecioUnitario: 20.02,
            subtotal: 500.50
          }
        ]
      },
      {
        id: 2,
        nProveedorId: 2,
        nombreProveedor: 'Proveedor B',
        dFecha: new Date('2024-01-10'),
        nTotal: 850.75,
        nEstado: 'Aprobada',
        detalles: [
          {
            id: 3,
            nInsumoId: 3,
            nombreInsumo: 'Aceite',
            nCantidad: 30,
            nPrecioUnitario: 28.35,
            subtotal: 850.50
          }
        ]
      },
      {
        id: 3,
        nProveedorId: 3,
        nombreProveedor: 'Proveedor C',
        dFecha: new Date('2024-01-08'),
        nTotal: 320.00,
        nEstado: 'Recibida',
        detalles: [
          {
            id: 4,
            nInsumoId: 4,
            nombreInsumo: 'Sal',
            nCantidad: 20,
            nPrecioUnitario: 16.00,
            subtotal: 320.00
          }
        ]
      }
    ];
  }

  agregarOrden(): void {
    this.router.navigate(['/ordenes-compra/agregar']);
  }

  editarOrden(id: number): void {
    this.router.navigate(['/ordenes-compra/editar', id]);
  }

  cambiarEstado(ordenId: number, nuevoEstado: string): void {
    const orden = this.ordenesCompra.find(o => o.id === ordenId);
    if (orden) {
      orden.nEstado = nuevoEstado;
      // Aquí iría la llamada al backend para actualizar el estado
      console.log(`Estado de orden ${ordenId} cambiado a: ${nuevoEstado}`);
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'badge-warning';
      case 'Aprobada': return 'badge-info';
      case 'Enviada': return 'badge-primary';
      case 'Recibida': return 'badge-success';
      case 'Cancelada': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }

  contarPorEstado(estado: string): number {
    return this.ordenesCompra.filter(orden => orden.nEstado === estado).length;
  }

  verDetalle(orden: OrdenCompra): void {
    this.ordenSeleccionada = orden;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.ordenSeleccionada = null;
  }

  editarDesdeModal(): void {
    if (this.ordenSeleccionada) {
      this.cerrarModal();
      this.editarOrden(this.ordenSeleccionada.id);
    }
  }
}