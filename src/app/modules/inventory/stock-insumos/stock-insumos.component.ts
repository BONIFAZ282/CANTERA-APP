// stock-insumos.component.ts
import { Component, OnInit } from '@angular/core';
import { InventarioService, StockInsumo } from '../../../auth/services/inventario.service';

@Component({
  selector: 'app-stock-insumos',
  templateUrl: './stock-insumos.component.html',
  styleUrls: ['./stock-insumos.component.scss']
})
export class StockInsumosComponent implements OnInit {

  insumos: StockInsumo[] = [];
  insumosFiltrados: StockInsumo[] = [];
  cargando = false;
  
  // Filtros
  filtroCategoria = 'Todas';
  filtroEstado = 'Todos';
  busqueda = '';
  
  // Categorías únicas
  categorias: string[] = [];

  constructor(private inventarioService: InventarioService) { }

  ngOnInit(): void {
    this.cargarStockInsumos();
  }

  cargarStockInsumos(): void {
    this.cargando = true;
    
    this.inventarioService.obtenerStockInsumos().subscribe({
      next: (data) => {
        this.insumos = data;
        this.insumosFiltrados = data;
        this.extraerCategorias();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar stock:', error);
        this.cargando = false;
      }
    });
  }

  extraerCategorias(): void {
    const categoriasUnicas = [...new Set(this.insumos.map(i => i.categoria))];
    this.categorias = ['Todas', ...categoriasUnicas];
  }

  aplicarFiltros(): void {
    this.insumosFiltrados = this.insumos.filter(insumo => {
      const coincideBusqueda = insumo.nombreInsumo.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincidenCategoria = this.filtroCategoria === 'Todas' || insumo.categoria === this.filtroCategoria;
      const coincidenEstado = this.filtroEstado === 'Todos' || insumo.estadoStock === this.filtroEstado;
      
      return coincideBusqueda && coincidenCategoria && coincidenEstado;
    });
  }

  onFiltroCategoriaChange(): void {
    this.aplicarFiltros();
  }

  onFiltroEstadoChange(): void {
    this.aplicarFiltros();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'SIN STOCK': return 'estado-sin-stock';
      case 'STOCK BAJO': return 'estado-stock-bajo';
      case 'STOCK MEDIO': return 'estado-stock-medio';
      case 'STOCK ALTO': return 'estado-stock-alto';
      default: return '';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'SIN STOCK': return 'error';
      case 'STOCK BAJO': return 'warning';
      case 'STOCK MEDIO': return 'info';
      case 'STOCK ALTO': return 'check_circle';
      default: return 'help';
    }
  }

  refrescar(): void {
    this.cargarStockInsumos();
  }

  getCountByEstado(estado: string): number {
    return this.insumosFiltrados.filter(insumo => insumo.estadoStock === estado).length;
  }
}
