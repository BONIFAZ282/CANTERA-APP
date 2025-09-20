// src/app/auth/services/inventario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StockInsumo {
  insumoId: number;
  nombreInsumo: string;
  unidadMedida: string;
  stockActual: number;
  categoria: string;
  estadoStock: 'SIN STOCK' | 'STOCK BAJO' | 'STOCK MEDIO' | 'STOCK ALTO';
}

export interface MovimientoInventario {
  movimientoId: number;
  fechaMovimiento: string;
  tipoMovimiento: string;
  nombreInsumo: string;
  unidadMedida: string;
  cantidadMovimiento: number;
  stockAnterior: number;
  stockNuevo: number;
  observaciones: string;
  pedidoId?: number;
  tipoOperacion: 'ENTRADA' | 'SALIDA';
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private API_URL = 'http://localhost:8080/api/inventario';

  constructor(private http: HttpClient) { }


  procesarSalidaInventarioPedido(pedidoId: number, usuarioId?: number): Observable<any> {
    const body = { pedidoId, usuarioId };
    console.log('📦 Procesando salida de inventario para pedido:', pedidoId);
    return this.http.post<any>(`${this.API_URL}/procesar-salida-pedido`, body);
  }

  obtenerStockInsumos(): Observable<StockInsumo[]> {
    console.log('📊 Obteniendo stock de insumos');
    return this.http.get<StockInsumo[]>(`${this.API_URL}/stock`);
  }

  obtenerReporteMovimientos(
    fechaDesde?: string,
    fechaHasta?: string,
    insumoId?: number,
    tipoMovimientoId?: number
  ): Observable<MovimientoInventario[]> {
    let params = new URLSearchParams();
    
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);
    if (insumoId) params.append('insumoId', insumoId.toString());
    if (tipoMovimientoId) params.append('tipoMovimientoId', tipoMovimientoId.toString());

    const url = params.toString() ? `${this.API_URL}/movimientos?${params.toString()}` : `${this.API_URL}/movimientos`;
    
    console.log('📋 Obteniendo reporte de movimientos');
    return this.http.get<MovimientoInventario[]>(url);
  }
}