// cobrar-pedido.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PedidoService } from '../../../auth/services/pedidos.service';
import { MesaService } from '../../../auth/services/mesa.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ClientePopupComponent } from '../cliente-popup/cliente-popup.component';
import { CajaService } from '../../../auth/services/caja.service';

export interface TipoPago {
  codigo: string;
  nombre: string;
  icono: string;
}

export interface Cliente {
  dni: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
}

export interface ComprobanteData {
  pedidoID: number;
  numeroComprobante?: string;
  mesa: string;
  mozo: string;
  fechaPago: Date;
  cliente: Cliente;
  items: any[];
  subtotal: number;
  descuento: number;
  propina: number;
  totalFinal: number;
  tipoPago: string;
  montoRecibido?: number;  // ← Ya está opcional
  vuelto?: number;         // ← Ya está opcional
}

@Component({
  selector: 'app-cobrar-pedido',
  templateUrl: './cobrar-pedido.component.html',
  styleUrls: ['./cobrar-pedido.component.scss']
})
export class CobrarPedidoComponent implements OnInit {

  // Datos del pedido
  pedidoID: number = 0;
  mesa: string = '';
  mozo: string = '';
  numeroPersonas: number = 0;
  observaciones: string = '';
  estado: string = '';
  fechaPedido: Date = new Date();
  itemsPedido: any[] = [];
  totalPedido: number = 0;

  // Datos de pago
  tiposPago: TipoPago[] = [
    { codigo: 'efectivo', nombre: 'Efectivo', icono: 'payments' },
    { codigo: 'tarjeta', nombre: 'Tarjeta', icono: 'credit_card' },
    { codigo: 'yape', nombre: 'Yape', icono: 'phone_android' },
    { codigo: 'plin', nombre: 'Plin', icono: 'smartphone' },
    { codigo: 'transferencia', nombre: 'Transferencia', icono: 'account_balance' }
  ];

  tipoPagoSeleccionado: string = 'efectivo';
  montoRecibido: number = 0;
  vuelto: number = 0;
  descuento: number = 0;
  propina: number = 0;

  // Datos del cliente
  clienteEncontrado: Cliente | null = null;

  // Estados
  cargandoPedido: boolean = true;
  procesandoPago: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private mesaService: MesaService,
    private http: HttpClient,
    private dialog: MatDialog,
    private cajaService: CajaService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.pedidoID = Number(params.get('pedidoId'));
      if (this.pedidoID) {
        this.cargarPedido();
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['mesa']) this.mesa = params['mesa'];
      if (params['mozo']) this.mozo = params['mozo'];
    });
  }


  cargarPedido(): void {
    this.cargandoPedido = true;

    this.pedidoService.obtenerPedidoParaEditar(this.pedidoID).subscribe({
      next: (datos) => {
        if (datos && datos.length > 0) {
          const primerRegistro = datos[0];

          // Cargar datos de la cabecera
          this.mesa = primerRegistro.Mesa;
          this.mozo = primerRegistro.Mozo;
          this.numeroPersonas = primerRegistro.NumeroPersonas;
          this.observaciones = primerRegistro.Observaciones || '';
          this.estado = primerRegistro.Estado;
          this.totalPedido = primerRegistro.Total;
          this.fechaPedido = new Date(primerRegistro.FechaPedido);

          // Construir items del pedido
          this.itemsPedido = datos.map(item => ({
            nombre: item.nombreProducto,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal
          }));

          // Inicializar monto recibido con el total
          this.montoRecibido = this.totalPedido;
          this.calcularVuelto();
        }

        this.cargandoPedido = false;
      },
      error: (error) => {
        console.error('Error al cargar pedido:', error);
        this.cargandoPedido = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el pedido para cobrar'
        }).then(() => {
          this.router.navigate(['/comanda']);
        });
      }
    });
  }



  get totalConDescuento(): number {
    return this.totalPedido - this.descuento;
  }

  get totalFinal(): number {
    return this.totalConDescuento + this.propina;
  }

  get cantidadTotalItems(): number {
    return this.itemsPedido.reduce((total, item) => total + item.cantidad, 0);
  }

  get esEfectivo(): boolean {
    return this.tipoPagoSeleccionado === 'efectivo';
  }

  onTipoPagoChange(): void {
    if (!this.esEfectivo) {
      this.montoRecibido = this.totalFinal;
      this.vuelto = 0;
    } else {
      this.calcularVuelto();
    }
  }

  onMontoRecibidoChange(): void {
    if (this.esEfectivo) {
      this.calcularVuelto();
    }
  }

  calcularVuelto(): void {
    if (this.esEfectivo && this.montoRecibido >= this.totalFinal) {
      this.vuelto = this.montoRecibido - this.totalFinal;
    } else {
      this.vuelto = 0;
    }
  }

  aplicarDescuento(): void {
    Swal.fire({
      title: 'Aplicar descuento',
      input: 'number',
      inputLabel: 'Monto del descuento (S/)',
      inputValue: this.descuento,
      inputAttributes: {
        min: '0',
        max: this.totalPedido.toString(),
        step: '0.01'
      },
      showCancelButton: true,
      confirmButtonText: 'Aplicar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && result.value >= 0) {
        this.descuento = Math.min(Number(result.value), this.totalPedido);
        this.calcularVuelto();
      }
    });
  }

  aplicarPropina(): void {
    Swal.fire({
      title: 'Agregar propina',
      input: 'number',
      inputLabel: 'Monto de propina (S/)',
      inputValue: this.propina,
      inputAttributes: {
        min: '0',
        step: '0.01'
      },
      showCancelButton: true,
      confirmButtonText: 'Aplicar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && result.value >= 0) {
        this.propina = Number(result.value);
        this.calcularVuelto();
      }
    });
  }

  procesarPago(): void {
    // Validaciones
    if (this.esEfectivo && this.montoRecibido < this.totalFinal) {
      Swal.fire({
        icon: 'warning',
        title: 'Monto insuficiente',
        text: 'El monto recibido es menor al total a pagar'
      });
      return;
    }

    Swal.fire({
      title: '¿Confirmar pago?',
      html: `
        <div style="text-align: left; margin: 1rem 0;">
          <p><strong>Mesa:</strong> ${this.mesa}</p>
          <p><strong>Tipo de pago:</strong> ${this.getTipoPagoNombre()}</p>
          <p><strong>Total:</strong> ${this.formatearMoneda(this.totalFinal)}</p>
          ${this.clienteEncontrado ? `<p><strong>Cliente:</strong> ${this.clienteEncontrado.nombre} ${this.clienteEncontrado.apellido}</p>` : ''}
          ${this.esEfectivo ? `
            <p><strong>Recibido:</strong> ${this.formatearMoneda(this.montoRecibido)}</p>
            <p><strong>Vuelto:</strong> ${this.formatearMoneda(this.vuelto)}</p>
          ` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669'
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmarPago();
      }
    });
  }

  private confirmarPago(): void {
    this.procesandoPago = true;

    // Preparar datos para el backend
    const comprobanteRequest = {
      pedidoID: this.pedidoID,
      clienteDNI: this.clienteEncontrado?.dni || null,
      clienteNombre: this.clienteEncontrado?.nombre || null,
      clienteApellido: this.clienteEncontrado?.apellido || null,
      tipoComprobante: "BOLETA",
      mesa: this.mesa,
      mozo: this.mozo,
      tipoPago: this.getTipoPagoNombre(),
      subtotal: this.totalPedido,
      descuento: this.descuento,
      propina: this.propina,
      totalFinal: this.totalFinal,
      montoRecibido: this.esEfectivo ? this.montoRecibido : this.totalFinal,
      vuelto: this.vuelto
    };

    console.log('🔄 Guardando comprobante en backend:', comprobanteRequest);

    // Paso 1: Guardar el comprobante
    this.pedidoService.guardarComprobante(comprobanteRequest).subscribe({
      next: (response) => {
        console.log('✅ Comprobante guardado exitosamente:', response);

        // Paso 2: Obtener los datos completos del comprobante desde el backend
        const comprobanteId = response.comprobanteID || response.id;

        if (comprobanteId) {
          this.pedidoService.obtenerComprobante(comprobanteId).subscribe({
            next: (datosComprobante) => {
              console.log('📋 Datos completos del comprobante:', datosComprobante);
              this.procesandoPago = false;
              this.mostrarBoletaConDatosReales(datosComprobante);
            },
            error: (error) => {
              console.error('❌ Error al obtener comprobante:', error);
              this.procesandoPago = false;
              // Fallback: mostrar con datos locales
              this.mostrarBoleta();
            }
          });
        } else {
          // Fallback si no hay ID en la respuesta
          this.procesandoPago = false;
          this.mostrarBoleta();
        }
      },
      error: (error) => {
        console.error('❌ Error al guardar comprobante:', error);
        this.procesandoPago = false;

        Swal.fire({
          icon: 'error',
          title: 'Error al procesar pago',
          text: 'Hubo un problema al guardar el comprobante. Por favor intente nuevamente.',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  private mostrarBoletaConDatosReales(datosBackend: any): void {
    // Usar los datos reales del backend con valores por defecto
    const comprobanteData: ComprobanteData = {
      pedidoID: datosBackend.pedidoID || this.pedidoID,
      numeroComprobante: datosBackend.numeroComprobante || `B001-${String(this.pedidoID).padStart(8, '0')}`,
      mesa: datosBackend.mesa || this.mesa,
      mozo: datosBackend.mozo || this.mozo,
      fechaPago: datosBackend.fechaPago ? new Date(datosBackend.fechaPago) : new Date(),
      cliente: this.clienteEncontrado || {
        dni: '',
        nombre: 'Cliente',
        apellido: 'General'
      },
      items: this.itemsPedido,
      subtotal: datosBackend.subtotal || this.totalPedido,
      descuento: datosBackend.descuento || this.descuento,
      propina: datosBackend.propina || this.propina,
      totalFinal: datosBackend.totalFinal || this.totalFinal,
      tipoPago: datosBackend.tipoPago || this.getTipoPagoNombre(),
      montoRecibido: datosBackend.montoRecibido || (this.esEfectivo ? this.montoRecibido : this.totalFinal),
      vuelto: datosBackend.vuelto || this.vuelto || 0
    };

    console.log('Datos finales del comprobante:', comprobanteData);
    this.abrirBoletaPopup(comprobanteData);
  }

  private mostrarBoleta(responseBackend?: any): void {
    const comprobanteData: ComprobanteData = {
      pedidoID: this.pedidoID,
      numeroComprobante: responseBackend?.numeroComprobante || `B001-${String(this.pedidoID).padStart(8, '0')}`,
      mesa: this.mesa,
      mozo: this.mozo,
      fechaPago: new Date(),
      cliente: this.clienteEncontrado || { dni: '', nombre: 'Cliente', apellido: 'General' },
      items: this.itemsPedido,
      subtotal: this.totalPedido,
      descuento: this.descuento,
      propina: this.propina,
      totalFinal: this.totalFinal,
      tipoPago: this.getTipoPagoNombre(),
      montoRecibido: this.esEfectivo ? this.montoRecibido : this.totalFinal,
      vuelto: this.vuelto
    };

    this.abrirBoletaPopup(comprobanteData);
  }

  private abrirBoletaPopup(data: ComprobanteData): void {
    const boletaHTML = this.generarBoletaHTML(data);

    Swal.fire({
      title: 'Comprobante de Pago',
      html: boletaHTML,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: 'Imprimir',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#4f46e5',
      customClass: {
        popup: 'boleta-popup',
        htmlContainer: 'boleta-container'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.imprimirBoleta(data);
      }
      this.finalizarPago();
    });
  }
  private generarBoletaHTML(data: ComprobanteData): string {
    const fechaFormateada = data.fechaPago.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Asegurar valores por defecto para evitar undefined
    const montoRecibido = data.montoRecibido || data.totalFinal;
    const vuelto = data.vuelto || 0;

    return `
    <div class="boleta-content">
      <div class="boleta-header">
        <h3>LA CANTERA RESTAURANT</h3>
        <p>RUC: 20123456789</p>
        <p>Av. Principal 123 - Ica, Perú</p>
        <p>Tel: (056) 123-4567</p>
        <hr>
        <h4>BOLETA DE VENTA ELECTRÓNICA</h4>
        <p><strong>N° ${data.numeroComprobante || 'N/A'}</strong></p>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
      </div>

      <div class="boleta-body">
        <div class="datos-venta">
          <p><strong>Mesa:</strong> ${data.mesa}</p>
          <p><strong>Mozo:</strong> ${data.mozo}</p>
          ${data.cliente.dni ? `<p><strong>Cliente:</strong> ${data.cliente.nombre} ${data.cliente.apellido}</p>` : ''}
          ${data.cliente.dni ? `<p><strong>DNI:</strong> ${data.cliente.dni}</p>` : ''}
        </div>

        <hr>

        <table class="items-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>P.Unit</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>S/ ${item.precioUnitario.toFixed(2)}</td>
                <td>S/ ${item.subtotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <hr>

        <div class="totales">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>S/ ${data.subtotal.toFixed(2)}</span>
          </div>
          ${data.descuento > 0 ? `
            <div class="total-row">
              <span>Descuento:</span>
              <span>-S/ ${data.descuento.toFixed(2)}</span>
            </div>
          ` : ''}
          ${data.propina > 0 ? `
            <div class="total-row">
              <span>Propina:</span>
              <span>+S/ ${data.propina.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-row total-final">
            <span><strong>TOTAL:</strong></span>
            <span><strong>S/ ${data.totalFinal.toFixed(2)}</strong></span>
          </div>
        </div>

        <hr>

        <div class="pago-info">
          <p><strong>Forma de Pago:</strong> ${data.tipoPago}</p>
          <p><strong>Monto Recibido:</strong> S/ ${montoRecibido.toFixed(2)}</p>
          ${vuelto > 0 ? `<p><strong>Vuelto:</strong> S/ ${vuelto.toFixed(2)}</p>` : ''}
        </div>
      </div>

      <div class="boleta-footer">
        <p>¡Gracias por su preferencia!</p>
        <p>Comprobante generado el ${fechaFormateada}</p>
      </div>
    </div>
  `;
  }

  // Reemplazar el método imprimirBoleta:
  private imprimirBoleta(data: ComprobanteData): void {
    // Preparar datos para el backend
    const comprobanteRequest = {
      pedidoID: data.pedidoID,
      clienteDNI: data.cliente.dni || null,
      clienteNombre: data.cliente.nombre || null,
      clienteApellido: data.cliente.apellido || null,
      tipoComprobante: "BOLETA",
      mesa: data.mesa,
      mozo: data.mozo,
      tipoPago: data.tipoPago,
      subtotal: data.subtotal,
      descuento: data.descuento,
      propina: data.propina,
      totalFinal: data.totalFinal,
      montoRecibido: data.montoRecibido || data.totalFinal,
      vuelto: data.vuelto || 0
    };

    console.log('Guardando comprobante en backend:', comprobanteRequest);

    // Paso 1: Guardar comprobante en el backend
    this.pedidoService.guardarComprobante(comprobanteRequest).subscribe({
      next: (response) => {
        console.log('✅ Comprobante guardado:', response);

        // Paso 2: Registrar venta en caja automáticamente
        this.registrarVentaEnCaja(response.comprobanteID, data);

        // Paso 3: Proceder con la impresión
        this.procederConImpresion(data, response);
      },
      error: (error) => {
        console.error('❌ Error al guardar comprobante:', error);
        this.mostrarErrorComprobante();
      }
    });
  }

  /**
   * Registrar la venta en el sistema de caja
   */
  private registrarVentaEnCaja(comprobanteId: number, data: ComprobanteData): void {
    const usuario = data.mozo; // Usar el mozo como usuario de caja

    this.cajaService.registrarVentaCaja(
      data.pedidoID,
      comprobanteId,
      data.tipoPago,
      data.totalFinal,
      data.propina,
      data.descuento,
      usuario
    ).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Venta registrada en caja correctamente');
        } else {
          console.warn('⚠️ Problema al registrar en caja:', response.mensaje);
          // No mostrar error al usuario, es secundario
        }
      },
      error: (error) => {
        console.error('❌ Error al registrar venta en caja:', error);
        // No mostrar error al usuario, es secundario al proceso principal
      }
    });
  }

  /**
   * Proceder con la impresión después de guardar comprobante
   */
  private procederConImpresion(data: ComprobanteData, response: any): void {
    // Actualizar datos del comprobante con la respuesta del backend
    data.numeroComprobante = response.numeroComprobante;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Boleta de Venta</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .boleta-content { max-width: 300px; margin: 0 auto; }
            .boleta-header { text-align: center; margin-bottom: 20px; }
            .boleta-header h3 { margin: 0; }
            .boleta-header p { margin: 2px 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #ddd; padding: 4px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total-final { border-top: 2px solid #000; font-weight: bold; }
            .boleta-footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          ${this.generarBoletaHTML(data)}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  /**
   * Mostrar error si no se puede guardar comprobante
   */
  private mostrarErrorComprobante(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: 'El pago se procesó pero hubo un problema al guardar el comprobante. ¿Desea imprimir de todos modos?',
      showCancelButton: true,
      confirmButtonText: 'Sí, imprimir',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        // Crear datos básicos para imprimir sin backend
        const datosBasicos: ComprobanteData = {
          pedidoID: this.pedidoID,
          numeroComprobante: `B001-${String(this.pedidoID).padStart(8, '0')}`,
          mesa: this.mesa,
          mozo: this.mozo,
          fechaPago: new Date(),
          cliente: this.clienteEncontrado || { dni: '', nombre: 'Cliente', apellido: 'General' },
          items: this.itemsPedido,
          subtotal: this.totalPedido,
          descuento: this.descuento,
          propina: this.propina,
          totalFinal: this.totalFinal,
          tipoPago: this.getTipoPagoNombre(),
          montoRecibido: this.esEfectivo ? this.montoRecibido : this.totalFinal,
          vuelto: this.vuelto
        };

        this.procederConImpresion(datosBasicos, { numeroComprobante: datosBasicos.numeroComprobante });
      }
    });
  }

  private finalizarPago(): void {
    this.cerrarMesaDespuesPago();
  }

  private cerrarMesaDespuesPago(): void {
    this.mesaService.actualizarMesaDesocupada(this.mesa).subscribe({
      next: () => {
        console.log(`Mesa ${this.mesa} liberada después del pago`);
        this.router.navigate(['/comanda']);
      },
      error: (error) => {
        console.error('Error al liberar mesa:', error);
        this.router.navigate(['/comanda']);
      }
    });
  }

  getTipoPagoNombre(): string {
    const tipo = this.tiposPago.find(t => t.codigo === this.tipoPagoSeleccionado);
    return tipo ? tipo.nombre : 'Efectivo';
  }

  getTipoPagoIcono(): string {
    const tipo = this.tiposPago.find(t => t.codigo === this.tipoPagoSeleccionado);
    return tipo ? tipo.icono : 'payments';
  }

  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  volver(): void {
    this.router.navigate(['/comanda']);
  }

  // Nuevo método para abrir el popup de cliente
  abrirPopupCliente(): void {
    const dialogRef = this.dialog.open(ClientePopupComponent, {
      width: '600px',
      maxWidth: '90vw',
      minWidth: '500px',        // ← Agregar
      height: 'auto',           // ← Agregar
      panelClass: 'custom-dialog-container',  // ← Agregar esta clase
      data: { cliente: this.clienteEncontrado },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clienteEncontrado = result;
        console.log('✅ Cliente guardado:', this.clienteEncontrado);
      }
    });
  }

  limpiarCliente(): void {
    this.clienteEncontrado = null;
  }
}