export interface MovimientoCaja {
  movimientoId: number;
  fechaMovimiento: string;
  sesionId: number;
  usuarioSesion: string;
  tipoMovimiento: string;
  esIngreso: boolean;
  descripcion: string;
  monto: number;
  tipoPago?: string;
  pedidoId?: number;
  comprobanteId?: number;
  usuario: string;
  observaciones?: string;
  mesaPedido?: string;
  numeroComprobante?: string;
  tipoOperacion: string;
  totalRegistros?: number;
}