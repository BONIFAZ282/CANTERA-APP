// src/app/auth/services/pedido.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoRequest, PedidoResponse } from '../models/pedidos.model';

@Injectable({
    providedIn: 'root'
})
export class PedidoService {

    private API_URL = 'http://localhost:8080/api/pedido'; // Cambia por tu URL

    constructor(private http: HttpClient) { }

    // Método para guardar pedido
    guardarPedido(pedido: PedidoRequest): Observable<PedidoResponse> {
        console.log('📤 Enviando pedido al backend:', pedido);
        return this.http.post<PedidoResponse>(`${this.API_URL}/guardar`, pedido);
    }
    // Método para listar pedidos
    listarPedidos(): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/listar`);
    }

    // Método para obtener pedido por ID
    obtenerPedidoPorId(id: number): Observable<any> {
        return this.http.get<any>(`${this.API_URL}/obtener/${id}`);
    }

    // Método para obtener detalle del pedido
    obtenerDetallePedido(pedidoId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/detalle/${pedidoId}`);
    }

    // Agregar este método a tu PedidoService
    obtenerPedidoParaEditar(pedidoId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/obtener-para-editar/${pedidoId}`);
    }

    // Método para actualizar pedido
    actualizarPedido(pedido: any): Observable<PedidoResponse> {
        return this.http.put<PedidoResponse>(`${this.API_URL}/actualizar`, pedido);
    }

    // Método para cambiar estado del pedido
    cambiarEstadoPedido(pedidoId: number, estado: string): Observable<any> {
        const body = { pedidoId, estado };
        return this.http.put(`${this.API_URL}/estado`, body);
    }

    // En pedidos.service.ts
    guardarComprobante(comprobante: any): Observable<any> {
        console.log('📤 Enviando comprobante al backend:', comprobante);
        return this.http.post<any>(`${this.API_URL.replace('pedido', 'comprobante')}/guardar`, comprobante);
    }


    obtenerComprobante(comprobanteId: number): Observable<any> {
    console.log('📥 Obteniendo comprobante del backend:', comprobanteId);
    return this.http.get<any>(`${this.API_URL.replace('pedido', 'comprobante')}/obtener/${comprobanteId}`);
    }
        
}