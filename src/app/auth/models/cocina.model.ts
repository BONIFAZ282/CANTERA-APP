export interface PedidoCocina {
  pedidoID: number;
  numero: number;
  mesa: string;
  mozo: string;
  estado: string;
  observaciones?: string;
  fechaPedido: string;
  hora: string;
  tiempoTranscurrido: number;
  tipo: string;
  totalItems: number;
}

export interface DetallePedidoCocina {
  pedidoID: number;
  numero: number;
  mesa: string;
  mozo: string;
  numeroPersonas: number;
  estado: string;
  observaciones?: string;
  total: number;
  fechaPedido: string;
  hora: string;
  tipo: string;
  detalleId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CambioEstadoRequest {
  pedidoID: number;
  nuevoEstado: string;
}

export interface EstadisticasCocina {
  pendientes: number;
  enPreparacion: number;
  listos: number;
  totalHoy: number;
  promedioTiempo: number;
}