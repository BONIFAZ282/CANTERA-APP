export interface ResumenCaja {
  tieneSesionActiva: boolean;
  sesionId?: number;
  usuario?: string;
  fechaApertura?: string;
  montoApertura?: number;
  totalIngresos?: number;
  totalEgresos?: number;
  montoActualCaja?: number;
  totalVentas?: number;
  mensaje?: string;
}