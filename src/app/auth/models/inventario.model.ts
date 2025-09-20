export interface StockInsumo {
  insumoId: number;
  nombreInsumo: string;
  unidadMedida: string;
  stockActual: number;
  categoria: string;
  estadoStock: 'SIN STOCK' | 'STOCK BAJO' | 'STOCK MEDIO' | 'STOCK ALTO';
}

export interface MovimientoInventario {
  movimientoId: number;
  fechaMovimiento: string;
  tipoMovimiento: string;
  nombreInsumo: string;
  unidadMedida: string;
  cantidadMovimiento: number;
  stockAnterior: number;
  stockNuevo: number;
  observaciones: string;
  pedidoId?: number;
  tipoOperacion: 'ENTRADA' | 'SALIDA';
}