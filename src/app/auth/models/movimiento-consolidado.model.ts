export interface MovimientoConsolidado {
  tipoSistema: string;
  fechaMovimiento: string;
  usuario: string;
  descripcion: string;
  detalle: string;
  montoAfectado: number;
  tipoOperacion: string;
  referencia: string;
  totalRegistros?: number;
}
