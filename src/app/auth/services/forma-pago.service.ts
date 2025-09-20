
// forma-pago.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FormaPago } from '../models/forma-pago.model';

@Injectable({
  providedIn: 'root'
})
export class FormaPagoService {

  private API_URL = 'http://localhost:8080/api/forma-pago';

  constructor(private http: HttpClient) { }

  listarFormasPago(): Observable<FormaPago[]> {
    const formasPago: FormaPago[] = [
      {
        nFormaPagoId: 1,
        cNombreFormaPago: 'Efectivo',
        cImagen: 'efectivo-icon.png',
        bEstado: true
      },
      {
        nFormaPagoId: 2,
        cNombreFormaPago: 'Tarjeta de Crédito',
        cImagen: 'tarjeta-credito-icon.png',
        bEstado: true
      },
      {
        nFormaPagoId: 3,
        cNombreFormaPago: 'Tarjeta de Débito',
        cImagen: 'tarjeta-debito-icon.png',
        bEstado: true
      },
      {
        nFormaPagoId: 4,
        cNombreFormaPago: 'Yape',
        cImagen: 'yape-icon.png',
        bEstado: true
      },
      {
        nFormaPagoId: 5,
        cNombreFormaPago: 'Plin',
        cImagen: 'plin-icon.png',
        bEstado: true
      },
      {
        nFormaPagoId: 6,
        cNombreFormaPago: 'Transferencia Bancaria',
        cImagen: 'transferencia-icon.png',
        bEstado: false
      }
    ];
    
    return of(formasPago);
  }

  guardarFormaPago(formaPago: FormaPago): Observable<any> {
    console.log('Guardando forma de pago:', formaPago);
    return of({ success: true, message: 'Forma de pago guardada correctamente' });
  }

  actualizarFormaPago(id: number, formaPago: FormaPago): Observable<any> {
    console.log('Actualizando forma de pago:', id, formaPago);
    return of({ success: true, message: 'Forma de pago actualizada correctamente' });
  }

  eliminarFormaPago(id: number): Observable<any> {
    console.log('Eliminando forma de pago:', id);
    return of({ success: true, message: 'Forma de pago eliminada correctamente' });
  }
}
