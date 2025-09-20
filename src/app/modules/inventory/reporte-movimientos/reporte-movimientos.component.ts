// reporte-movimientos.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventarioService, MovimientoInventario } from '../../../auth/services/inventario.service';


@Component({
  selector: 'app-reporte-movimientos',
  templateUrl: './reporte-movimientos.component.html',
  styleUrls: ['./reporte-movimientos.component.scss']
})
export class ReporteMovimientosComponent implements OnInit {

  movimientos: MovimientoInventario[] = [];
  movimientosFiltrados: MovimientoInventario[] = [];
  cargando = false;

  filtrosForm: FormGroup;

  constructor(
    private inventarioService: InventarioService,
    private fb: FormBuilder
  ) {
    // Fecha de hoy y hace 30 días
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    this.filtrosForm = this.fb.group({
      fechaDesde: [hace30Dias.toISOString().split('T')[0]],
      fechaHasta: [hoy.toISOString().split('T')[0]],
      tipoOperacion: ['Todos']
    });
  }

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    this.cargando = true;

    const filtros = this.filtrosForm.value;

    this.inventarioService.obtenerReporteMovimientos(
      filtros.fechaDesde,
      filtros.fechaHasta
    ).subscribe({
      next: (data) => {
        this.movimientos = data;
        this.aplicarFiltrosLocales();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar movimientos:', error);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarMovimientos();
  }

  aplicarFiltrosLocales(): void {
    this.movimientosFiltrados = this.movimientos.filter(mov => {
      const tipoOperacion = this.filtrosForm.value.tipoOperacion;
      return tipoOperacion === 'Todos' || mov.tipoOperacion === tipoOperacion;
    });
  }

  onTipoOperacionChange(): void {
    this.aplicarFiltrosLocales();
  }

  exportarExcel(): void {
    // Implementar exportación a Excel
    console.log('Exportar a Excel:', this.movimientosFiltrados);
  }

  getOperacionClass(tipo: string): string {
    return tipo === 'ENTRADA' ? 'operacion-entrada' : 'operacion-salida';
  }

  getOperacionIcon(tipo: string): string {
    return tipo === 'ENTRADA' ? 'arrow_upward' : 'arrow_downward';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-PE');
  }

  formatearCantidad(cantidad: number): string {
    const abs = Math.abs(cantidad);
    return cantidad > 0 ? `+${abs}` : `-${abs}`;
  }

  getCountByTipo(tipo: string): number {
    return this.movimientosFiltrados.filter(mov => mov.tipoOperacion === tipo).length;
  }
}