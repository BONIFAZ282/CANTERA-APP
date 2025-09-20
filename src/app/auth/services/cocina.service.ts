import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CambioEstadoRequest, DetallePedidoCocina, EstadisticasCocina, PedidoCocina } from '../models/cocina.model';


@Injectable({
  providedIn: 'root'
})
export class CocinaService {

  private API_URL = 'http://localhost:8080/api/cocina';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los pedidos agrupados por estado
   */
  obtenerPedidosCocina(): Observable<{ [estado: string]: PedidoCocina[] }> {
    console.log('📥 Obteniendo pedidos de cocina');
    return this.http.get<{ [estado: string]: PedidoCocina[] }>(`${this.API_URL}/pedidos`);
  }

  /**
   * Obtener pedidos por estado específico
   */
  obtenerPedidosPorEstado(estado: string): Observable<PedidoCocina[]> {
    console.log(`📥 Obteniendo pedidos en estado: ${estado}`);
    return this.http.get<PedidoCocina[]>(`${this.API_URL}/pedidos/${estado}`);
  }

  /**
   * Cambiar estado de un pedido
   */
  cambiarEstadoPedido(pedidoID: number, nuevoEstado: string): Observable<any> {
    const request: CambioEstadoRequest = { pedidoID, nuevoEstado };
    console.log('📤 Cambiando estado de pedido:', request);
    return this.http.put<any>(`${this.API_URL}/cambiar-estado`, request);
  }

  /**
   * Obtener detalle completo de un pedido
   */
  obtenerDetallePedido(pedidoId: number): Observable<{ detallePedido: DetallePedidoCocina[] }> {
    console.log(`📥 Obteniendo detalle del pedido: ${pedidoId}`);
    return this.http.get<{ detallePedido: DetallePedidoCocina[] }>(`${this.API_URL}/pedido/${pedidoId}/detalle`);
  }

  /**
   * Obtener estadísticas de cocina
   */
  obtenerEstadisticas(): Observable<EstadisticasCocina> {
    console.log('📊 Obteniendo estadísticas de cocina');
    return this.http.get<EstadisticasCocina>(`${this.API_URL}/estadisticas`);
  }
}