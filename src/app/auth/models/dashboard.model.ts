export interface DashboardData {
  ventasDelDia: VentasDelDia;
  cajaActual: CajaActual;
  pedidosActivos: PedidosActivos;
  stockCritico: StockCritico[];
  productoMasVendido: ProductoMasVendido;
  deliveryInfo: DeliveryInfo;
  ventasSemanales: VentasSemanal[];
  ventasPorCategoria: VentasPorCategoria[];
}

export interface VentasDelDia {
  totalVentas: number;
  cantidadPedidos: number;
  promedioTicket: number;
}

export interface CajaActual {
  efectivo: number;
  tarjeta: number;
  delivery: number;
  yape: number;
  plin: number;
  transferencia: number;
  total: number;
}

export interface PedidosActivos {
  enCocina: number;
  pendientes: number;
  completados: number;
  total: number;
}

export interface StockCritico {
  insumoId: number;
  nombreInsumo: string;
  stockActual: number;
  stockMinimo: number;
  unidadMedida: string;
  categoria: string;
}

export interface ProductoMasVendido {
  productoId: number;
  nombreProducto: string;
  cantidadVendida: number;
  totalIngresos: number;
}

export interface DeliveryInfo {
  enCamino: number;
  sinAsignar: number;
  completados: number;
  total: number;
}

export interface VentasSemanal {
  fecha: string; // Como string desde el backend
  total: number;
  cantidadPedidos: number;
}

export interface VentasPorCategoria {
  categoria: string;
  total: number;
}