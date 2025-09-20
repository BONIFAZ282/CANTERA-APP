// caja-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/AuthService';
import Swal from 'sweetalert2';
import { ResumenCaja } from '../../../auth/models/resumenCaja.model';
import { CajaService } from '../../../auth/services/caja.service';

@Component({
  selector: 'app-caja-dashboard',
  templateUrl: './caja-dashboard.component.html',
  styleUrls: ['./caja-dashboard.component.scss']
})
export class CajaDashboardComponent implements OnInit {

  resumenCaja: ResumenCaja | null = null;
  usuario: string = '';
  cargando = false;

  constructor(
    private cajaService: CajaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.usuario = this.authService.getUsername() || 'Usuario';
    this.cargarResumenCaja();
  }

  cargarResumenCaja(): void {
    this.cargando = true;
    
    this.cajaService.obtenerResumenCajaActual(this.usuario).subscribe({
      next: (resumen) => {
        this.resumenCaja = resumen;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar resumen de caja:', error);
        this.cargando = false;
      }
    });
  }

  abrirCaja(): void {
    Swal.fire({
      title: 'Abrir Caja',
      html: `
        <div style="text-align: left;">
          <p><strong>Usuario:</strong> ${this.usuario}</p>
          <p>Ingresa el monto inicial en efectivo:</p>
        </div>
      `,
      input: 'number',
      inputLabel: 'Monto de apertura (S/)',
      inputValue: 0,
      inputAttributes: {
        min: '0',
        step: '0.01'
      },
      showCancelButton: true,
      confirmButtonText: 'Abrir Caja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669'
    }).then((result) => {
      if (result.isConfirmed && result.value >= 0) {
        const montoApertura = Number(result.value);
        this.procesarAperturaCaja(montoApertura);
      }
    });
  }

  private procesarAperturaCaja(montoApertura: number): void {
    this.cajaService.abrirSesionCaja(this.usuario, montoApertura, 'Apertura de turno').subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Caja abierta',
            text: `Caja abierta con S/ ${montoApertura.toFixed(2)}`,
            timer: 2000,
            timerProgressBar: true
          });
          this.cargarResumenCaja();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error al abrir caja:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo abrir la caja'
        });
      }
    });
  }

  cerrarCaja(): void {
    if (!this.resumenCaja?.tieneSesionActiva) return;

    Swal.fire({
      title: 'Cerrar Caja',
      html: `
        <div style="text-align: left;">
          <p><strong>Resumen del turno:</strong></p>
          <p>Monto inicial: S/ ${this.resumenCaja.montoApertura?.toFixed(2)}</p>
          <p>Total ventas: S/ ${this.resumenCaja.totalIngresos?.toFixed(2)}</p>
          <p>Total egresos: S/ ${this.resumenCaja.totalEgresos?.toFixed(2)}</p>
          <p><strong>Debería tener: S/ ${this.resumenCaja.montoActualCaja?.toFixed(2)}</strong></p>
          <br>
          <p>Ingresa el monto real en caja:</p>
        </div>
      `,
      input: 'number',
      inputLabel: 'Monto real en caja (S/)',
      inputValue: this.resumenCaja.montoActualCaja,
      inputAttributes: {
        min: '0',
        step: '0.01'
      },
      showCancelButton: true,
      confirmButtonText: 'Cerrar Caja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (result.isConfirmed && result.value >= 0) {
        const montoCierre = Number(result.value);
        this.procesarCierreCaja(montoCierre);
      }
    });
  }

  private procesarCierreCaja(montoCierre: number): void {
    const diferencia = montoCierre - (this.resumenCaja?.montoActualCaja || 0);
    const observaciones = diferencia !== 0 ? 
      `Diferencia: S/ ${diferencia.toFixed(2)} ${diferencia > 0 ? 'sobrante' : 'faltante'}` : 
      'Cierre exacto';

    this.cajaService.cerrarSesionCaja(this.usuario, montoCierre, observaciones).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: diferencia === 0 ? 'success' : 'warning',
            title: 'Caja cerrada',
            html: `
              <div style="text-align: left;">
                <p>Caja cerrada correctamente</p>
                ${diferencia !== 0 ? `<p style="color: ${diferencia > 0 ? '#059669' : '#dc2626'}"><strong>${observaciones}</strong></p>` : ''}
              </div>
            `,
            timer: 3000,
            timerProgressBar: true
          });
          this.cargarResumenCaja();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error al cerrar caja:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cerrar la caja'
        });
      }
    });
  }

  verReporteCaja(): void {
    // Navegar al componente de reporte de caja
    // this.router.navigate(['/caja/reporte']);
    console.log('Navegar a reporte de caja');
  }

  formatearMoneda(valor?: number): string {
    return valor ? `S/ ${valor.toFixed(2)}` : 'S/ 0.00';
  }

  formatearFecha(fecha?: string): string {
    return fecha ? new Date(fecha).toLocaleString('es-PE') : '';
  }

  get diferenciaCaja(): number {
    if (!this.resumenCaja?.tieneSesionActiva) return 0;
    return (this.resumenCaja?.totalIngresos || 0) - (this.resumenCaja?.totalEgresos || 0);
  }

  get estadoCaja(): string {
    if (!this.resumenCaja?.tieneSesionActiva) return 'Cerrada';
    return 'Abierta';
  }
}