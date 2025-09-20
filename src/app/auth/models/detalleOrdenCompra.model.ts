export interface DetalleOrdenCompra {
  detalleId: number;
  ordenCompraId: number;
  insumoId: number;
  nombreInsumo: string;
  unidadMedida: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}