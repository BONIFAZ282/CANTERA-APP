import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovimientoInventario } from './inventario.service';
import { PaginatedResponse } from '../models/paginated-response.model';
import { UsuarioMovimiento } from '../models/usuario-movimiento.model';
import { TipoMovimiento } from '../models/tipo-movimiento.model';
import { EstadisticasMovimientos } from '../models/estadisticas-movimientos.model';
import { MovimientoConsolidado } from '../models/movimiento-consolidado.model';
import { MovimientoCaja } from '../models/movimientoCaja.model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private API_URL = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) { }

  // Movimientos de Inventario
  obtenerMovimientosInventario(
    fechaDesde?: string,
    fechaHasta?: string,
    insumoId?: number,
    tipoMovimientoId?: number,
    usuario?: string,
    pageNumber: number = 1,
    pageSize: number = 50
  ): Observable<PaginatedResponse<MovimientoInventario>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    if (insumoId) params = params.set('insumoId', insumoId.toString());
    if (tipoMovimientoId) params = params.set('tipoMovimientoId', tipoMovimientoId.toString());
    if (usuario) params = params.set('usuario', usuario);

    return this.http.get<PaginatedResponse<MovimientoInventario>>(`${this.API_URL}/movimientos/inventario`, { params });
  }

  // Movimientos de Caja
  obtenerMovimientosCaja(
    fechaDesde?: string,
    fechaHasta?: string,
    tipoMovimientoId?: number,
    usuario?: string,
    sesionId?: number,
    tipoPago?: string,
    pageNumber: number = 1,
    pageSize: number = 50
  ): Observable<PaginatedResponse<MovimientoCaja>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    if (tipoMovimientoId) params = params.set('tipoMovimientoId', tipoMovimientoId.toString());
    if (usuario) params = params.set('usuario', usuario);
    if (sesionId) params = params.set('sesionId', sesionId.toString());
    if (tipoPago) params = params.set('tipoPago', tipoPago);

    return this.http.get<PaginatedResponse<MovimientoCaja>>(`${this.API_URL}/movimientos/caja`, { params });
  }

  // Movimientos Consolidados
  obtenerMovimientosConsolidados(
    fechaDesde?: string,
    fechaHasta?: string,
    usuario?: string,
    tipoMovimiento?: string,
    pageNumber: number = 1,
    pageSize: number = 50
  ): Observable<PaginatedResponse<MovimientoConsolidado>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    if (usuario) params = params.set('usuario', usuario);
    if (tipoMovimiento) params = params.set('tipoMovimiento', tipoMovimiento);

    return this.http.get<PaginatedResponse<MovimientoConsolidado>>(`${this.API_URL}/movimientos/consolidados`, { params });
  }

  // Estadísticas
  obtenerEstadisticas(fechaDesde?: string, fechaHasta?: string): Observable<EstadisticasMovimientos> {
    let params = new HttpParams();
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);

    return this.http.get<EstadisticasMovimientos>(`${this.API_URL}/estadisticas`, { params });
  }

  // Catálogos
  obtenerTiposMovimiento(): Observable<TipoMovimiento[]> {
    return this.http.get<TipoMovimiento[]>(`${this.API_URL}/tipos-movimiento`);
  }

  obtenerUsuarios(): Observable<UsuarioMovimiento[]> {
    return this.http.get<UsuarioMovimiento[]>(`${this.API_URL}/usuarios`);
  }
}