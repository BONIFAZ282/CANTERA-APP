export interface OrdenCompraRequest {
  proveedorId: number;
  usuario: string;
  observaciones?: string;
  detalles: DetalleOrdenCompraRequest[];
}

export interface DetalleOrdenCompraRequest {
  insumoId: number;
  cantidad: number;
  precioUnitario: number;
}