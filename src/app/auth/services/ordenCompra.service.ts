import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../models/proveedor.model';
import { Insumo } from '../models/insumo.model'; // Tu modelo existente
import { OrdenCompraRequest } from '../models/ordenCompraRequest.model';
import { OrdenCompra } from '../models/ordenCompra.model';
import { DetalleOrdenCompra } from '../models/detalleOrdenCompra.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {

  private API_URL = 'http://localhost:8080/api/ordenCompra';
  private PROVEEDOR_URL = 'http://localhost:8080/api/proveedor';
  private INSUMO_URL = 'http://localhost:8080/api/insumo'; // Cambio: usar tu endpoint

  constructor(private http: HttpClient) { }

  // =================== ÓRDENES DE COMPRA ===================
  // (Los métodos de orden de compra se mantienen igual)

  crearOrdenCompra(request: OrdenCompraRequest): Observable<any> {
    console.log('📋 Creando orden de compra:', request);
    return this.http.post<any>(`${this.API_URL}/crear`, request);
  }

  listarOrdenesCompra(
    fechaInicio?: string,
    fechaFin?: string,
    proveedorId?: number,
    estadoId?: number
  ): Observable<OrdenCompra[]> {
    let params = new HttpParams();
    
    if (fechaInicio) params = params.append('fechaInicio', fechaInicio);
    if (fechaFin) params = params.append('fechaFin', fechaFin);
    if (proveedorId) params = params.append('proveedorId', proveedorId.toString());
    if (estadoId) params = params.append('estadoId', estadoId.toString());

    return this.http.get<OrdenCompra[]>(`${this.API_URL}/listar`, { params });
  }

  obtenerDetalleOrden(ordenCompraId: number): Observable<OrdenCompra> {
    return this.http.get<OrdenCompra>(`${this.API_URL}/${ordenCompraId}`);
  }

  obtenerDetallesOrden(ordenCompraId: number): Observable<DetalleOrdenCompra[]> {
    return this.http.get<DetalleOrdenCompra[]>(`${this.API_URL}/${ordenCompraId}/detalle`);
  }

  recibirOrdenCompra(ordenCompraId: number, usuario: string, observaciones?: string): Observable<any> {
    const body = { ordenCompraId, usuario, observaciones };
    return this.http.post<any>(`${this.API_URL}/recibir`, body);
  }

  registrarPagoOrden(
    ordenCompraId: number,
    tipoPago: string,
    montoPagado: number,
    usuario: string,
    observaciones?: string,
    tipoComprobante: string = 'FACTURA'
  ): Observable<any> {
    const body = { ordenCompraId, tipoPago, montoPagado, usuario, observaciones, tipoComprobante };
    return this.http.post<any>(`${this.API_URL}/registrar-pago`, body);
  }

  anularOrdenCompra(ordenCompraId: number, usuario: string, motivoAnulacion: string): Observable<any> {
    const body = { ordenCompraId, usuario, motivoAnulacion };
    return this.http.post<any>(`${this.API_URL}/anular`, body);
  }

  // =================== PROVEEDORES ===================

  listarProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.PROVEEDOR_URL}/listar`);
  }


  listarInsumos(): Observable<Insumo[]> {
    console.log('📦 Listando insumos desde tu microservicio');
    return this.http.get<Insumo[]>(`${this.INSUMO_URL}/listar`);
  }


  buscarInsumos(nombre: string): Observable<Insumo[]> {
    return new Observable(observer => {
      this.listarInsumos().subscribe({
        next: (insumos) => {
          const filtrados = insumos.filter(insumo => 
            insumo.supplyName.toLowerCase().includes(nombre.toLowerCase())
          );
          observer.next(filtrados);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }



  obtenerInsumosStockBajo(): Observable<Insumo[]> {
    return new Observable(observer => {
      this.listarInsumos().subscribe({
        next: (insumos) => {
          const stockBajo = insumos.filter(insumo => insumo.currentStock < 20);
          observer.next(stockBajo);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
