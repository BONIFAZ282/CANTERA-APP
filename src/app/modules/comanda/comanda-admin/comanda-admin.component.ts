import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-comanda-admin',
  templateUrl: './comanda-admin.component.html',
  styleUrls: ['./comanda-admin.component.scss']
})
export class ComandaAdminComponent implements OnInit, OnDestroy {
  pedidosActivos = 12;
  pedidosLlevar = 8;
  pedidosEntregados = 47;

  // Datos de cambios desde ayer
  cambioActivos = '+3';
  cambioLlevar = '+2';
  cambioEntregados = '+12';

  private refreshSubscription?: Subscription;

  ngOnInit(): void {
    // Actualizar datos cada 30 segundos
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.actualizarDatos();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  actualizarDatos(): void {
    // Simular actualización de datos (aquí harías llamada al servicio)
    this.pedidosActivos = Math.floor(Math.random() * 20) + 5;
    this.pedidosLlevar = Math.floor(Math.random() * 15) + 3;
    this.pedidosEntregados = Math.floor(Math.random() * 50) + 30;
    
    // Simular cambios aleatorios
    this.cambioActivos = Math.random() > 0.5 ? `+${Math.floor(Math.random() * 5) + 1}` : `-${Math.floor(Math.random() * 3) + 1}`;
    this.cambioLlevar = Math.random() > 0.5 ? `+${Math.floor(Math.random() * 4) + 1}` : `-${Math.floor(Math.random() * 2) + 1}`;
    this.cambioEntregados = `+${Math.floor(Math.random() * 15) + 5}`;
  }

  refrescarManual(): void {
    this.actualizarDatos();
  }

  getCambioClass(cambio: string): string {
    return cambio.startsWith('+') ? 'positive' : 'negative';
  }
}