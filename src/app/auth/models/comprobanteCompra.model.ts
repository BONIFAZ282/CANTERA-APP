export interface ComprobanteCompra {
  comprobanteCompraId: number;
  ordenCompraId: number;
  proveedorId: number;
  tipoComprobante: string;
  numeroComprobante: string;
  fechaPago: string;
  tipoPago: string;
  subtotal: number;
  igv: number;
  totalFinal: number;
  estado: string;
  observaciones?: string;
  
  // Datos del proveedor
  proveedorNombre: string;
  proveedorRuc: string;
  proveedorDireccion?: string;
  proveedorTelefono?: string;
}

export interface DetalleComprobanteCompra {
  detalleId: number;
  comprobanteCompraId: number;
  insumoId: number;
  nombreInsumo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}