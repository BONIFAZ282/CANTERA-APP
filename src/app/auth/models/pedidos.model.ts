import { Producto } from "./producto.model";


export interface ItemPedido {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}


export interface DetalleProducto {
  productoID: number;        // era ProductoID
  nombreProducto: string;    // era NombreProducto
  cantidad: number;          // era Cantidad
  precioUnitario: number;    // era PrecioUnitario
}

export interface PedidoRequest {
  mesa: string;
  mozo: string;
  numeroPersonas: number;
  observaciones?: string | null;
  detalleJSON: DetalleProducto[];
}

// Nueva interfaz para manejar la respuesta del backend
export interface PedidoResponse {
  pedidoID: number;
  total: number;
  mensaje: string;
}