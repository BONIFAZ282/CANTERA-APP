import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResumenCaja } from '../models/resumenCaja.model';
import { MovimientoCaja } from '../models/movimientoCaja.model';


@Injectable({
  providedIn: 'root'
})
export class CajaService {

  private API_URL = 'http://localhost:8080/api/caja';

  constructor(private http: HttpClient) { }

  /**
   * Registrar venta en caja cuando se cobra un pedido
   */
  registrarVentaCaja(
    pedidoId: number,
    comprobanteId: number,
    tipoPago: string,
    montoTotal: number,
    montoPropina: number = 0,
    montoDescuento: number = 0,
    usuario: string
  ): Observable<any> {
    const body = {
      pedidoId,
      comprobanteId,
      tipoPago,
      montoTotal,
      montoPropina,
      montoDescuento,
      usuario
    };
    console.log('💰 Registrando venta en caja:', body);
    return this.http.post<any>(`${this.API_URL}/registrar-venta`, body);
  }

  /**
   * Abrir sesión de caja
   */
  abrirSesionCaja(usuario: string, montoApertura: number, observaciones?: string): Observable<any> {
    const body = { usuario, montoApertura, observaciones };
    console.log('🔓 Abriendo sesión de caja:', body);
    return this.http.post<any>(`${this.API_URL}/abrir-sesion`, body);
  }

  /**
   * Obtener resumen de caja actual
   */
  obtenerResumenCajaActual(usuario: string): Observable<ResumenCaja> {
    console.log('📊 Obteniendo resumen de caja para:', usuario);
    return this.http.get<ResumenCaja>(`${this.API_URL}/resumen-actual/${usuario}`);
  }

  /**
   * Obtener reporte de movimientos de caja
   */
  obtenerReporteCaja(
    sesionId?: number,
    usuario?: string,
    fechaDesde?: string,
    fechaHasta?: string
  ): Observable<MovimientoCaja[]> {
    let params = new URLSearchParams();
    
    if (sesionId) params.append('sesionId', sesionId.toString());
    if (usuario) params.append('usuario', usuario);
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);

    const url = params.toString() ? `${this.API_URL}/reporte?${params.toString()}` : `${this.API_URL}/reporte`;
    
    console.log('📋 Obteniendo reporte de caja');
    return this.http.get<MovimientoCaja[]>(url);
  }

  /**
   * Cerrar sesión de caja
   */
  cerrarSesionCaja(usuario: string, montoCierre: number, observaciones?: string): Observable<any> {
    const body = { usuario, montoCierre, observaciones };
    console.log('🔒 Cerrando sesión de caja:', body);
    return this.http.post<any>(`${this.API_URL}/cerrar-sesion`, body);
  }
}