// proveedores.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Proveedor } from '../models/proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  private API_URL = 'http://localhost:8080/api/proveedores';

  constructor(private http: HttpClient) { }

  listarProveedores(): Observable<Proveedor[]> {
    const proveedores: Proveedor[] = [
      {
        supplierId: 1,
        supplierName: 'Avícola San Juan',
        ruc: '20123456789',
        phone: '987654321',
        address: 'Av. Aviación 123, Lima',
        status: true
      },
      {
        supplierId: 2,
        supplierName: 'Distribuidora La Granja',
        ruc: '20987654321',
        phone: '965432187',
        address: 'Jr. Los Mercados 456, San Isidro',
        status: true
      },
      {
        supplierId: 3,
        supplierName: 'Verduras Frescas SAC',
        ruc: '20456789123',
        phone: '912345678',
        address: 'Mercado Central Stand 15',
        status: true
      },
      {
        supplierId: 4,
        supplierName: 'Lácteos del Norte',
        ruc: '20789123456',
        phone: '934567890',
        address: 'Carretera Norte Km 25',
        status: false
      }
    ];
    
    return of(proveedores);
  }

  guardarProveedor(proveedor: Proveedor): Observable<any> {
    console.log('Guardando proveedor:', proveedor);
    return of({ success: true, message: 'Proveedor guardado correctamente' });
  }

  actualizarProveedor(id: number, proveedor: Proveedor): Observable<any> {
    console.log('Actualizando proveedor:', id, proveedor);
    return of({ success: true, message: 'Proveedor actualizado correctamente' });
  }

  eliminarProveedor(id: number): Observable<any> {
    console.log('Eliminando proveedor:', id);
    return of({ success: true, message: 'Proveedor eliminado correctamente' });
  }
}