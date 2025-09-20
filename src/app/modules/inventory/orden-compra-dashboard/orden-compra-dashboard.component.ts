
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/AuthService';
import Swal from 'sweetalert2';
import { Proveedor } from '../../../auth/models/proveedor.model';
import { Insumo } from '../../../auth/models/insumo.model';
import { OrdenCompraService } from '../../../auth/services/ordenCompra.service';
import { OrdenCompra } from '../../../auth/models/ordenCompra.model';
import { DetalleOrdenCompraRequest, OrdenCompraRequest } from '../../../auth/models/ordenCompraRequest.model';

@Component({
  selector: 'app-orden-compra-dashboard',
  templateUrl: './orden-compra-dashboard.component.html',
  styleUrls: ['./orden-compra-dashboard.component.scss']
})
export class OrdenCompraDashboardComponent implements OnInit {

  ordenes: OrdenCompra[] = [];
  proveedores: Proveedor[] = [];
  insumosStockBajo: Insumo[] = [];
  usuario: string = '';
  cargando = false;

  // Filtros
  filtroEstado = 1;
  filtroProveedor?: number;
  fechaInicio?: string;
  fechaFin?: string;
  private ordenesPagadas: Set<number> = new Set();

  // Estadísticas
  estadisticas = {
    totalPendientes: 0,
    totalRecibidas: 0,
    totalAnuladas: 0,
    totalPagadas: 0,  // AGREGAR ESTA LÍNEA
    montoTotalPendiente: 0,
    insumosStockBajo: 0
  };

  constructor(
    private ordenCompraService: OrdenCompraService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.usuario = this.authService.getUsername() || 'Usuario';
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    Promise.all([
      this.cargarOrdenes(),
      this.cargarProveedores(),
      this.cargarInsumosStockBajo()
    ]).finally(() => {
      this.cargando = false;
    });
  }
  cargarOrdenes(): Promise<void> {
    return new Promise((resolve) => {
      this.ordenCompraService.listarOrdenesCompra(
        this.fechaInicio,
        this.fechaFin,
        this.filtroProveedor,
        undefined // No filtrar por estadoId en el backend, filtraremos en frontend
      ).subscribe({
        next: (ordenes) => {
          // Filtrar según el tab seleccionado
          switch (this.filtroEstado) {
            case 1: // Pendientes
              this.ordenes = ordenes.filter(o => o.estado === 'Pendiente');
              break;
            case 2: // Recibidas (no pagadas)
              this.ordenes = ordenes.filter(o => o.estado === 'Recibida' && !o.pagado);
              break;
            case 3: // Anuladas
              this.ordenes = ordenes.filter(o => o.estado === 'Anulada');
              break;
            case 4: // Pagadas
              this.ordenes = ordenes.filter(o => o.pagado === true);
              break;
            default:
              this.ordenes = ordenes;
          }

          this.calcularEstadisticas();
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar órdenes:', error);
          resolve();
        }
      });
    });
  }

  cargarProveedores(): Promise<void> {
    return new Promise((resolve) => {
      this.ordenCompraService.listarProveedores().subscribe({
        next: (proveedores) => {
          this.proveedores = proveedores.filter(p => p.status);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar proveedores:', error);
          resolve();
        }
      });
    });
  }

  cargarInsumosStockBajo(): Promise<void> {
    return new Promise((resolve) => {
      this.ordenCompraService.obtenerInsumosStockBajo().subscribe({
        next: (insumos) => {
          this.insumosStockBajo = insumos;
          this.estadisticas.insumosStockBajo = insumos.length;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar insumos stock bajo:', error);
          resolve();
        }
      });
    });
  }


  calcularEstadisticas(): void {
    this.ordenCompraService.listarOrdenesCompra().subscribe({
      next: (todasOrdenes) => {
        // Pendientes: estado "Pendiente" 
        this.estadisticas.totalPendientes = todasOrdenes.filter(o =>
          o.estado === 'Pendiente'
        ).length;

        // Recibidas: estado "Recibida" pero NO pagadas
        this.estadisticas.totalRecibidas = todasOrdenes.filter(o =>
          o.estado === 'Recibida' && !o.pagado
        ).length;

        // Pagadas: cualquier estado pero con pagado = true
        this.estadisticas.totalPagadas = todasOrdenes.filter(o =>
          o.pagado === true
        ).length;

        // Anuladas: estado "Anulada"
        this.estadisticas.totalAnuladas = todasOrdenes.filter(o =>
          o.estado === 'Anulada'
        ).length;

        // Monto total pendiente
        this.estadisticas.montoTotalPendiente = todasOrdenes
          .filter(o => o.estado === 'Pendiente')
          .reduce((sum, o) => sum + o.total, 0);
      }
    });
  }

  crearNuevaOrden(): void {
    // Paso 1: Seleccionar proveedor
    Swal.fire({
      title: 'Nueva Orden de Compra',
      html: `
      <div style="text-align: left;">
        <p>Selecciona un proveedor para comenzar:</p>
        <select id="proveedorSelect" class="swal2-input" style="width: 100%;">
          <option value="">Seleccionar proveedor...</option>
          ${this.proveedores.map(p => `<option value="${p.supplierId}">${p.supplierName} - ${p.ruc}</option>`).join('')}
        </select>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
      preConfirm: () => {
        const proveedorId = (document.getElementById('proveedorSelect') as HTMLSelectElement).value;
        if (!proveedorId) {
          Swal.showValidationMessage('Por favor selecciona un proveedor');
          return false;
        }
        return parseInt(proveedorId);
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.abrirFormularioOrden(result.value);
      }
    });
  }

  abrirFormularioOrden(proveedorId: number): void {
    // Crear formulario dinámico para seleccionar productos
    this.mostrarFormularioInsumos(proveedorId);
  }

  mostrarFormularioInsumos(proveedorId: number): void {
    const proveedor = this.proveedores.find(p => p.supplierId === proveedorId);

    Swal.fire({
      title: `Orden para: ${proveedor?.supplierName}`,
      html: `
      <div id="formulario-orden" style="text-align: left; max-height: 400px; overflow-y: auto;">
        <div style="margin-bottom: 16px;">
          <input type="text" id="buscarInsumo" class="swal2-input" 
                 placeholder="Buscar insumo..." style="margin-bottom: 10px;">
        </div>
        
        <div id="lista-insumos">
          <p>Cargando insumos...</p>
        </div>
        
        <div id="insumos-seleccionados" style="margin-top: 20px; padding-top: 16px; border-top: 2px solid #e2e8f0;">
          <h4>Insumos seleccionados: <span id="contador-items">0</span></h4>
          <div id="items-seleccionados"></div>
          <div style="text-align: right; margin-top: 12px; font-weight: bold;">
            Total: S/ <span id="total-orden">0.00</span>
          </div>
        </div>
      </div>
    `,
      width: '700px',
      showCancelButton: true,
      confirmButtonText: 'Crear Orden',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
      preConfirm: () => {
        const insumosSeleccionados = this.obtenerInsumosSeleccionados();
        if (insumosSeleccionados.length === 0) {
          Swal.showValidationMessage('Debes seleccionar al menos un insumo');
          return false;
        }
        return insumosSeleccionados;
      },
      didOpen: () => {
        this.inicializarFormularioInsumos();
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.crearOrdenConInsumos(proveedorId, result.value);
      }
    });
  }

  private insumosDisponibles: Insumo[] = [];
  private insumosSeleccionados: Map<number, { insumo: Insumo, cantidad: number, precio: number }> = new Map();

  inicializarFormularioInsumos(): void {
    // Cargar todos los insumos
    this.ordenCompraService.listarInsumos().subscribe({
      next: (insumos) => {
        this.insumosDisponibles = insumos;
        this.renderizarListaInsumos(insumos);
        this.configurarBuscador();
      },
      error: (error) => {
        console.error('Error al cargar insumos:', error);
        document.getElementById('lista-insumos')!.innerHTML = '<p style="color: red;">Error al cargar insumos</p>';
      }
    });
  }

  renderizarListaInsumos(insumos: Insumo[]): void {
    const listaContainer = document.getElementById('lista-insumos')!;

    if (insumos.length === 0) {
      listaContainer.innerHTML = '<p>No se encontraron insumos</p>';
      return;
    }

    const html = insumos.map(insumo => `
    <div class="insumo-item" style="
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 12px; 
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      margin-bottom: 8px;
      background: white;
    ">
      <div style="flex: 1;">
        <div style="font-weight: 600; color: #1e293b;">${insumo.supplyName}</div>
        <div style="font-size: 0.85rem; color: #64748b;">
          Stock: ${insumo.currentStock} ${insumo.unitOfMeasure} | 
          Categoría: ${insumo.supplyCategoryName}
        </div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="number" 
               id="cantidad-${insumo.supplyId}" 
               placeholder="Cant." 
               min="1" 
               step="1"
               style="width: 70px; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        <input type="number" 
               id="precio-${insumo.supplyId}" 
               placeholder="Precio" 
               min="0.01" 
               step="0.01"
               style="width: 80px; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        <button type="button" 
                onclick="agregarInsumo(${insumo.supplyId})" 
                style="
                  background: #059669; 
                  color: white; 
                  border: none; 
                  padding: 6px 12px; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 0.85rem;
                ">
          Agregar
        </button>
      </div>
    </div>
  `).join('');

    listaContainer.innerHTML = html;

    // Agregar función global para agregar insumos
    (window as any).agregarInsumo = (insumoId: number) => {
      this.agregarInsumoAOrden(insumoId);
    };
  }



  configurarBuscador(): void {
    const buscador = document.getElementById('buscarInsumo') as HTMLInputElement;
    buscador.addEventListener('input', (event) => {
      const termino = (event.target as HTMLInputElement).value.toLowerCase();
      const insumosFiltrados = this.insumosDisponibles.filter(insumo =>
        insumo.supplyName.toLowerCase().includes(termino) ||
        insumo.supplyCategoryName.toLowerCase().includes(termino)
      );
      this.renderizarListaInsumos(insumosFiltrados);
    });
  }

  agregarInsumoAOrden(insumoId: number): void {
    const cantidadInput = document.getElementById(`cantidad-${insumoId}`) as HTMLInputElement;
    const precioInput = document.getElementById(`precio-${insumoId}`) as HTMLInputElement;

    const cantidad = parseFloat(cantidadInput.value);
    const precio = parseFloat(precioInput.value);

    if (!cantidad || cantidad <= 0) {
      Swal.showValidationMessage('Ingresa una cantidad válida');
      return;
    }

    if (!precio || precio <= 0) {
      Swal.showValidationMessage('Ingresa un precio válido');
      return;
    }

    const insumo = this.insumosDisponibles.find(i => i.supplyId === insumoId);
    if (!insumo) return;

    // Agregar o actualizar insumo seleccionado
    this.insumosSeleccionados.set(insumoId, { insumo, cantidad, precio });

    // Limpiar inputs
    cantidadInput.value = '';
    precioInput.value = '';

    // Actualizar vista de seleccionados
    this.actualizarInsumosSeleccionados();
  }


  actualizarInsumosSeleccionados(): void {
    const container = document.getElementById('items-seleccionados')!;
    const contador = document.getElementById('contador-items')!;
    const totalElement = document.getElementById('total-orden')!;

    if (this.insumosSeleccionados.size === 0) {
      container.innerHTML = '<p style="color: #64748b; font-style: italic;">Ningún insumo seleccionado</p>';
      contador.textContent = '0';
      totalElement.textContent = '0.00';
      return;
    }

    let total = 0;
    const html = Array.from(this.insumosSeleccionados.values()).map((item, index) => {
      const subtotal = item.cantidad * item.precio;
      total += subtotal;

      return `
      <div style="
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 8px 12px; 
        background: #f8fafc; 
        border-radius: 6px; 
        margin-bottom: 6px;
      ">
        <div style="flex: 1;">
          <span style="font-weight: 500;">${item.insumo.supplyName}</span>
          <span style="color: #64748b; font-size: 0.85rem;">
            - ${item.cantidad} ${item.insumo.unitOfMeasure} × S/ ${item.precio.toFixed(2)}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-weight: 600;">S/ ${subtotal.toFixed(2)}</span>
          <button type="button" 
                  onclick="eliminarInsumo(${item.insumo.supplyId})"
                  style="
                    background: #dc2626; 
                    color: white; 
                    border: none; 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 0.75rem;
                  ">
            ×
          </button>
        </div>
      </div>
    `;
    }).join('');

    container.innerHTML = html;
    contador.textContent = this.insumosSeleccionados.size.toString();
    totalElement.textContent = total.toFixed(2);

    // Agregar función global para eliminar insumos
    (window as any).eliminarInsumo = (insumoId: number) => {
      this.insumosSeleccionados.delete(insumoId);
      this.actualizarInsumosSeleccionados();
    };
  }

  obtenerInsumosSeleccionados(): DetalleOrdenCompraRequest[] {
    return Array.from(this.insumosSeleccionados.values()).map(item => ({
      insumoId: item.insumo.supplyId,
      cantidad: item.cantidad,
      precioUnitario: item.precio
    }));
  }
  crearOrdenConInsumos(proveedorId: number, detalles: DetalleOrdenCompraRequest[]): void {
    const request: OrdenCompraRequest = {
      proveedorId,
      usuario: this.usuario,
      observaciones: 'Orden creada manualmente',
      detalles
    };

    this.ordenCompraService.crearOrdenCompra(request).subscribe({
      next: (response) => {
        if (response.success) {
          // Limpiar selección
          this.insumosSeleccionados.clear();

          Swal.fire({
            icon: 'success',
            title: 'Orden creada',
            html: `
            <div style="text-align: left;">
              <p><strong>Orden #${response.ordenCompraId}</strong></p>
              <p>Total: <strong>S/ ${response.total.toFixed(2)}</strong></p>
              <p>Estado: <strong>Pendiente</strong></p>
              <hr>
              <p style="color: #059669;">✅ La orden está lista para recibir mercadería</p>
            </div>
          `,
            timer: 4000,
            timerProgressBar: true
          });
          this.cargarOrdenes();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error al crear orden:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la orden de compra'
        });
      }
    });
  }


  crearOrdenAutomatica(proveedorId: number): void {
    const detalles: DetalleOrdenCompraRequest[] = this.insumosStockBajo.slice(0, 5).map(insumo => ({
      insumoId: insumo.supplyId,
      cantidad: Math.max(50 - insumo.currentStock, 10),
      precioUnitario: 5.0
    }));

    const request: OrdenCompraRequest = {
      proveedorId,
      usuario: this.usuario,
      observaciones: 'Orden automática para reponer stock bajo',
      detalles
    };

    this.ordenCompraService.crearOrdenCompra(request).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Orden creada',
            text: `Orden #${response.ordenCompraId} creada por S/ ${response.total.toFixed(2)}`,
            timer: 3000,
            timerProgressBar: true
          });
          this.cargarOrdenes();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error al crear orden:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la orden de compra'
        });
      }
    });
  }

  verDetalleOrden(orden: OrdenCompra): void {
    this.ordenCompraService.obtenerDetallesOrden(orden.ordenCompraId).subscribe({
      next: (detalles) => {
        const detalleHtml = detalles.map(d =>
          `<tr>
            <td style="text-align:left; padding: 8px;">${d.nombreInsumo}</td>
            <td style="text-align:center; padding: 8px;">${d.cantidad} ${d.unidadMedida}</td>
            <td style="text-align:right; padding: 8px;">S/ ${d.precioUnitario.toFixed(2)}</td>
            <td style="text-align:right; padding: 8px;">S/ ${d.subtotal.toFixed(2)}</td>
          </tr>`
        ).join('');

        Swal.fire({
          title: `Orden #${orden.ordenCompraId}`,
          html: `
            <div style="text-align: left;">
              <p><strong>Proveedor:</strong> ${orden.proveedorNombre}</p>
              <p><strong>Estado:</strong> ${orden.estado}</p>
              <p><strong>Fecha:</strong> ${this.formatearFecha(orden.fecha)}</p>
              <hr>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 8px; text-align:left;">Insumo</th>
                    <th style="padding: 8px; text-align:center;">Cantidad</th>
                    <th style="padding: 8px; text-align:right;">P. Unit.</th>
                    <th style="padding: 8px; text-align:right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${detalleHtml}</tbody>
              </table>
              <hr>
              <p style="text-align: right;"><strong>Total: S/ ${orden.total.toFixed(2)}</strong></p>
            </div>
          `,
          width: '700px',
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: 'Cerrar'
        });
      }
    });
  }
  recibirOrden(orden: OrdenCompra): void {

    if (orden.estado !== 'Pendiente') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'Solo se pueden recibir órdenes en estado Pendiente'
      });
      return;
    }


    // Cambiar la validación para aceptar string o number
    if (orden.estadoId != 1 && orden.estado !== 'Pendiente') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'Solo se pueden recibir órdenes en estado Pendiente'
      });
      return;
    }

    Swal.fire({
      title: 'Recibir Mercadería',
      html: `
      <div style="text-align: left;">
        <p><strong>Orden:</strong> #${orden.ordenCompraId}</p>
        <p><strong>Proveedor:</strong> ${orden.proveedorNombre}</p>
        <p><strong>Total:</strong> S/ ${orden.total.toFixed(2)}</p>
        <hr>
        <p style="color: #059669;">
          ✅ Al confirmar se actualizará automáticamente el inventario<br>
          📦 El estado cambiará a "Recibida"<br>
          💰 Después podrás registrar el pago
        </p>
        <textarea id="observaciones" class="swal2-textarea" 
                 placeholder="Observaciones sobre la recepción (opcional)"></textarea>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'Recibir Mercadería',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
      preConfirm: () => {
        const observaciones = (document.getElementById('observaciones') as HTMLTextAreaElement).value;
        return observaciones;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarRecepcion(orden.ordenCompraId, result.value);
      }
    });
  }

  private procesarRecepcion(ordenCompraId: number, observaciones: string): void {
    this.ordenCompraService.recibirOrdenCompra(ordenCompraId, this.usuario, observaciones).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Mercadería recibida',
            text: 'Inventario actualizado correctamente',
            timer: 2000,
            timerProgressBar: true
          });
          this.cargarOrdenes();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error al recibir orden:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo procesar la recepción'
        });
      }
    });
  }

  registrarPago(orden: OrdenCompra): void {

    if (orden.estado !== 'Recibida') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'Solo se puede pagar órdenes en estado Recibida'
      });
      return;
    }

    if (orden.pagado) {
      Swal.fire({
        icon: 'info',
        title: 'Orden ya pagada',
        text: 'Esta orden ya fue pagada anteriormente.'
      });
      return;
    }


    if (orden.estadoId != 2 && orden.estado !== 'Recibida') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'Solo se puede pagar órdenes en estado Recibida'
      });
      return;
    }

    // NUEVA VALIDACIÓN: Verificar si ya está pagada
    if (orden.pagado) {
      Swal.fire({
        icon: 'info',
        title: 'Orden ya pagada',
        html: `
        <div style="text-align: left;">
          <p><strong>Orden #${orden.ordenCompraId}</strong></p>
          <p>Esta orden ya fue pagada anteriormente.</p>
          <p style="color: #059669;">✅ Estado: Pagado</p>
        </div>
      `,
        confirmButtonText: 'Entendido'
      });
      return;
    }

 Swal.fire({
    title: 'Registrar Pago a Proveedor',
    html: `
      <div style="text-align: left;">
        <p><strong>Orden:</strong> #${orden.ordenCompraId}</p>
        <p><strong>Proveedor:</strong> ${orden.proveedorNombre}</p>
        <p><strong>Monto a pagar:</strong> S/ ${orden.total.toFixed(2)}</p>
        <hr>
        
        <label>Tipo de comprobante:</label>
        <select id="tipoComprobante" class="swal2-input">
          <option value="FACTURA" selected>Factura</option>
          <option value="BOLETA">Boleta</option>
          <option value="RECIBO">Recibo</option>
        </select>
        
        <label>Método de pago:</label>
        <select id="tipoPago" class="swal2-input">
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia" selected>Transferencia</option>
          <option value="Cheque">Cheque</option>
        </select>
        
        <input id="montoPago" class="swal2-input" type="number" step="0.01" 
               value="${orden.total}" placeholder="Monto pagado">
        <textarea id="observacionesPago" class="swal2-textarea" 
                 placeholder="Observaciones del pago (opcional)"></textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Registrar Pago y Generar Comprobante',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3b82f6',
    preConfirm: () => {
      const tipoComprobante = (document.getElementById('tipoComprobante') as HTMLSelectElement).value;
      const tipoPago = (document.getElementById('tipoPago') as HTMLSelectElement).value;
      const montoPago = parseFloat((document.getElementById('montoPago') as HTMLInputElement).value);
      const observaciones = (document.getElementById('observacionesPago') as HTMLTextAreaElement).value;
      
      if (!montoPago || montoPago <= 0) {
        Swal.showValidationMessage('Ingresa un monto válido');
        return false;
      }
      
      return { tipoComprobante, tipoPago, montoPago, observaciones };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { tipoComprobante, tipoPago, montoPago, observaciones } = result.value;
      this.procesarPagoConComprobante(orden.ordenCompraId, tipoComprobante, tipoPago, montoPago, observaciones);
    }
  });
}

private procesarPagoConComprobante(ordenCompraId: number, tipoComprobante: string, tipoPago: string, montoPago: number, observaciones: string): void {
  // Actualizar tu servicio para incluir tipoComprobante
  this.ordenCompraService.registrarPagoOrden(ordenCompraId, tipoPago, montoPago, this.usuario, observaciones, tipoComprobante).subscribe({
    next: (response) => {
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Pago procesado',
          html: `
            <div style="text-align: left;">
              <p>✅ Pago registrado: <strong>S/ ${montoPago.toFixed(2)}</strong></p>
              <p>📄 Comprobante generado: <strong>${tipoComprobante}</strong></p>
              <p>💰 Registrado en caja</p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Ver Comprobante',
          cancelButtonText: 'Continuar',
          timer: 5000,
          timerProgressBar: true
        }).then((result) => {
          if (result.isConfirmed) {
            this.verComprobanteCompra(ordenCompraId);
          }
        });
        this.cargarOrdenes();
      }
    }
  });
}

// Agregar este método en orden-compra-dashboard.component.ts

verComprobanteCompra(ordenCompraId: number): void {
  // Primero necesitas crear el servicio para obtener el comprobante
  this.ordenCompraService.obtenerComprobanteCompra(ordenCompraId).subscribe({
    next: (comprobante) => {
      this.mostrarComprobante(comprobante);
    },
    error: (error) => {
      console.error('Error al obtener comprobante:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el comprobante'
      });
    }
  });
}

private mostrarComprobante(comprobante: any): void {
  Swal.fire({
    title: `${comprobante.tipoComprobante} ${comprobante.numeroComprobante}`,
    html: `
      <div style="text-align: left; font-family: monospace;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h3>TU EMPRESA</h3>
          <p>RUC: 20123456789</p>
          <p>Dirección: Tu dirección</p>
        </div>
        
        <hr>
        
        <p><strong>Proveedor:</strong> ${comprobante.proveedorNombre}</p>
        <p><strong>RUC:</strong> ${comprobante.proveedorRuc}</p>
        <p><strong>Fecha:</strong> ${this.formatearFecha(comprobante.fechaPago)}</p>
        <p><strong>Tipo Pago:</strong> ${comprobante.tipoPago}</p>
        
        <hr>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; text-align:left;">Descripción</th>
              <th style="padding: 8px; text-align:center;">Cant.</th>
              <th style="padding: 8px; text-align:right;">P.Unit</th>
              <th style="padding: 8px; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${comprobante.detalles?.map((d: any) => `
              <tr>
                <td style="padding: 4px;">${d.nombreInsumo}</td>
                <td style="padding: 4px; text-align:center;">${d.cantidad}</td>
                <td style="padding: 4px; text-align:right;">S/ ${d.precioUnitario.toFixed(2)}</td>
                <td style="padding: 4px; text-align:right;">S/ ${d.subtotal.toFixed(2)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
        
        <hr>
        
        <div style="text-align: right;">
          <p>Subtotal: S/ ${comprobante.subtotal.toFixed(2)}</p>
          <p>IGV (18%): S/ ${comprobante.igv.toFixed(2)}</p>
          <p><strong>Total: S/ ${comprobante.totalFinal.toFixed(2)}</strong></p>
        </div>
      </div>
    `,
    width: '600px',
    showCancelButton: true,
    confirmButtonText: 'Imprimir',
    cancelButtonText: 'Cerrar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.imprimirComprobante(comprobante);
    }
  });
}

private imprimirComprobante(comprobante: any): void {
  const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
  if (ventanaImpresion) {
    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>${comprobante.tipoComprobante} ${comprobante.numeroComprobante}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>TU EMPRESA</h2>
            <p>RUC: 20123456789</p>
            <p>Dirección: Tu dirección</p>
            <h3>${comprobante.tipoComprobante} ${comprobante.numeroComprobante}</h3>
          </div>
          
          <div class="details">
            <p><strong>Proveedor:</strong> ${comprobante.proveedorNombre}</p>
            <p><strong>RUC:</strong> ${comprobante.proveedorRuc}</p>
            <p><strong>Fecha:</strong> ${this.formatearFecha(comprobante.fechaPago)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>P. Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${comprobante.detalles?.map((d: any) => `
                <tr>
                  <td>${d.nombreInsumo}</td>
                  <td>${d.cantidad}</td>
                  <td>S/ ${d.precioUnitario.toFixed(2)}</td>
                  <td>S/ ${d.subtotal.toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: S/ ${comprobante.subtotal.toFixed(2)}</p>
            <p>IGV (18%): S/ ${comprobante.igv.toFixed(2)}</p>
            <p><strong>Total: S/ ${comprobante.totalFinal.toFixed(2)}</strong></p>
          </div>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    ventanaImpresion.print();
  }
}

  private procesarPago(ordenCompraId: number, tipoPago: string, montoPago: number, observaciones: string): void {
    this.ordenCompraService.registrarPagoOrden(ordenCompraId, tipoPago, montoPago, this.usuario, observaciones).subscribe({
      next: (response) => {
        if (response.success) {
          // IMPORTANTE: Marcar como pagada
          this.ordenesPagadas.add(ordenCompraId);

          Swal.fire({
            icon: 'success',
            title: 'Pago registrado',
            html: `
              <div style="text-align: left;">
                <p>Pago de <strong>S/ ${montoPago.toFixed(2)}</strong> registrado en caja</p>
                <p style="color: #059669;">✅ La orden está marcada como pagada</p>
              </div>
            `,
            timer: 3000,
            timerProgressBar: true
          });
          this.cargarOrdenes();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error al registrar pago:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar el pago'
        });
      }
    });
  }


  anularOrden(orden: OrdenCompra): void {

    if (orden.estado !== 'Pendiente') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'Solo se pueden anular órdenes en estado Pendiente'
      });
      return;
    }


    if (orden.estadoId != 1 && orden.estado !== 'Pendiente') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'Solo se pueden anular órdenes en estado Pendiente'
      });
      return;
    }

    Swal.fire({
      title: '¿Anular orden?',
      html: `
        <div style="text-align: left;">
          <p><strong>Orden:</strong> #${orden.ordenCompraId}</p>
          <p><strong>Proveedor:</strong> ${orden.proveedorNombre}</p>
          <p><strong>Total:</strong> S/ ${orden.total.toFixed(2)}</p>
          <hr>
          <p>Indica el motivo de la anulación:</p>
          <textarea id="motivoAnulacion" class="swal2-textarea" 
                   placeholder="Motivo de anulación" required></textarea>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Anular Orden',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      preConfirm: () => {
        const motivo = (document.getElementById('motivoAnulacion') as HTMLTextAreaElement).value;
        if (!motivo.trim()) {
          Swal.showValidationMessage('Debes indicar el motivo');
          return false;
        }
        return motivo;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarAnulacion(orden.ordenCompraId, result.value);
      }
    });
  }

  private procesarAnulacion(ordenCompraId: number, motivo: string): void {
    this.ordenCompraService.anularOrdenCompra(ordenCompraId, this.usuario, motivo).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Orden anulada',
            text: 'La orden ha sido anulada correctamente',
            timer: 2000,
            timerProgressBar: true
          });
          this.cargarOrdenes();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje
          });
        }
      },
      error: (error) => {
        console.error('Error al anular orden:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo anular la orden'
        });
      }
    });
  }

  cambiarFiltro(nuevoEstado: number): void {
    this.filtroEstado = nuevoEstado;
    this.cargarOrdenes();
  }

  aplicarFiltros(): void {
    this.cargarOrdenes();
  }

  limpiarFiltros(): void {
    this.filtroProveedor = undefined;
    this.fechaInicio = undefined;
    this.fechaFin = undefined;
    this.cargarOrdenes();
  }

  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE');
  }

  getEstadoClass(estadoId: number): string {
    switch (estadoId) {
      case 1: return 'pendiente';
      case 2: return 'recibida';
      case 3: return 'anulada';
      default: return '';
    }
  }

  getEstadoTexto(estadoId: number): string {
    switch (estadoId) {
      case 1: return 'Pendiente';
      case 2: return 'Recibida';
      case 3: return 'Anulada';
      case 4: return 'Pagadas';  // AGREGAR ESTA LÍNEA
      default: return 'Desconocido';
    }
  }
}