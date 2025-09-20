export interface MovimientoInventario {
  movimientoId: number;
  fechaMovimiento: string;
  tipoMovimiento: string;
  insumoId: number;
  nombreInsumo: string;
  unidadMedida: string;
  categoriaInsumo: string;
  cantidadMovimiento: number;
  stockAnterior: number;
  stockNuevo: number;
  observaciones?: string;
  pedidoId?: number;
  usuario: string;
  mesaPedido?: string;
  tipoOperacion: string;
  totalRegistros?: number;
}