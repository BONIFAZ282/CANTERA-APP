export interface MovimientoCaja {
  movimientoId: number;
  sesionId: number;
  usuario: string;
  fechaMovimiento: string;
  tipoMovimiento: string;
  esIngreso: boolean;
  descripcion: string;
  monto: number;
  tipoPago?: string;
  pedidoId?: number;
  comprobanteId?: number;
  observaciones?: string;
  tipoOperacion: 'INGRESO' | 'EGRESO';
}
