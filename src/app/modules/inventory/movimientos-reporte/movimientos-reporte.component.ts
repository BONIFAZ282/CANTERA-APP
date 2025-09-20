import { Component, OnInit } from '@angular/core';
import { EstadisticasMovimientos } from '../../../auth/models/estadisticas-movimientos.model';
import { TipoMovimiento } from '../../../auth/models/tipo-movimiento.model';
import { UsuarioMovimiento } from '../../../auth/models/usuario-movimiento.model';
import { ReportesService } from '../../../auth/services/reportes.service';

@Component({
  selector: 'app-movimientos-reporte',
  templateUrl: './movimientos-reporte.component.html',
  styleUrl: './movimientos-reporte.component.scss'
})
export class MovimientosReporteComponent implements OnInit {
  // Datos principales
  movimientos: any[] = [];
  estadisticas: EstadisticasMovimientos = {
    totalMovimientosInventario: 0,
    totalEntradasInventario: 0,
    totalSalidasInventario: 0,
    totalMovimientosCaja: 0,
    totalIngresosCaja: 0,
    totalEgresosCaja: 0,
    totalVentas: 0,
    balanceNeto: 0
  };

  // Catálogos
  tiposMovimiento: TipoMovimiento[] = [];
  usuarios: UsuarioMovimiento[] = [];

  // Filtros
  filtros = {
    fechaDesde: '',
    fechaHasta: '',
    tipoOperacion: 'Todos',
    usuario: '',
    tipoMovimiento: ''
  };

  // Paginación
  paginacion = {
    pageNumber: 1,
    pageSize: 20,
    totalRegistros: 0,
    totalPaginas: 0
  };

  // Control de estado
  cargando = false;
  vistaActual: 'inventario' | 'caja' | 'consolidado' = 'consolidado';

  // Opciones de tipo de operación
  tiposOperacion = [
    { value: 'Todos', label: 'Todos' },
    { value: 'INVENTARIO', label: 'Solo Inventario' },
    { value: 'CAJA', label: 'Solo Caja' }
  ];

  constructor(private reportesService: ReportesService) {
    // Inicializar fechas (últimos 7 días)
    const hoy = new Date();
    const hace7Dias = new Date(hoy.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    this.filtros.fechaDesde = this.formatearFecha(hace7Dias);
    this.filtros.fechaHasta = this.formatearFecha(hoy);
  }

  ngOnInit() {
    this.cargarCatalogos();
    this.cargarEstadisticas();
    this.cargarMovimientos(); // Cambiar por el método específico
  }

  cargarCatalogos() {
    // Cargar tipos de movimiento
    this.reportesService.obtenerTiposMovimiento().subscribe({
      next: (tipos) => {
        this.tiposMovimiento = tipos;
      },
      error: (error) => console.error('Error al cargar tipos de movimiento:', error)
    });

    // Cargar usuarios
    this.reportesService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => console.error('Error al cargar usuarios:', error)
    });
  }

  cargarEstadisticas() {
    this.reportesService.obtenerEstadisticas(
      this.filtros.fechaDesde,
      this.filtros.fechaHasta
    ).subscribe({
      next: (stats) => {
        this.estadisticas = stats;
      },
      error: (error) => console.error('Error al cargar estadísticas:', error)
    });
  }

  aplicarFiltros() {
    this.cargando = true;
    this.paginacion.pageNumber = 1; // Solo resetear a 1 cuando se aplican filtros
    this.cargarMovimientos();
  }

  cargarMovimientos() {
    this.cargando = true;

    // Usar vista consolidada por defecto
    this.reportesService.obtenerMovimientosConsolidados(
      this.filtros.fechaDesde,
      this.filtros.fechaHasta,
      this.filtros.usuario || undefined,
      this.filtros.tipoOperacion === 'Todos' ? undefined : this.filtros.tipoOperacion,
      this.paginacion.pageNumber,
      this.paginacion.pageSize
    ).subscribe({
      next: (response) => {
        this.movimientos = response.data;
        this.paginacion.totalRegistros = response.totalRegistros;
        this.paginacion.totalPaginas = response.totalPaginas;
        this.cargando = false;
        
        // Actualizar estadísticas solo cuando se aplican filtros
        if (this.paginacion.pageNumber === 1) {
          this.cargarEstadisticas();
        }
      },
      error: (error) => {
        console.error('Error al cargar movimientos:', error);
        this.cargando = false;
      }
    });
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.paginacion.totalPaginas) {
      this.paginacion.pageNumber = pagina;
      this.cargarMovimientos(); // Llamar al método específico para cargar datos
    }
  }

  exportarExcel() {
    // Implementar exportación a Excel
    console.log('Exportando a Excel...');
    // Aquí podrías usar una librería como xlsx para exportar los datos
  }

  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  formatearFechaHora(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-PE') + ', ' + 
           fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  }

  obtenerClaseOperacion(tipoOperacion: string): string {
    switch (tipoOperacion) {
      case 'ENTRADA':
      case 'INGRESO':
        return 'operacion-entrada';
      case 'SALIDA':
      case 'EGRESO':
        return 'operacion-salida';
      default:
        return '';
    }
  }

  obtenerIconoSistema(tipoSistema: string): string {
    return tipoSistema === 'INVENTARIO' ? '📦' : '💰';
  }

  get paginasArray(): number[] {
    const paginas = [];
    const inicio = Math.max(1, this.paginacion.pageNumber - 2);
    const fin = Math.min(this.paginacion.totalPaginas, this.paginacion.pageNumber + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }
}
