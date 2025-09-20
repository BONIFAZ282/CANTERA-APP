// forma-pago.model.ts
export interface FormaPago {
  nFormaPagoId?: number;
  cNombreFormaPago: string;
  cImagen?: string;
  bEstado: boolean;
}