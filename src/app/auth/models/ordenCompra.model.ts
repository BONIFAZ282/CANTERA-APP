export interface OrdenCompra {
  ordenCompraId: number;
  proveedorId: number;
  estadoId: number;
  fecha: string;
  total: number;
  proveedorNombre: string;
  proveedorRuc: string;
  proveedorTelefono?: string;
  proveedorDireccion?: string;
  estado: string;
  totalItems?: number;
  pagado?: boolean;
}