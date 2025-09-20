// comanda-pedido.component.ts - MODIFICADO
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Categoria } from '../../../auth/models/categoria.model';
import { Producto } from '../../../auth/models/producto.model';
import { CategoriService } from '../../../auth/services/caterogia.service';
import { ProductoService } from '../../../auth/services/producto.service';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from '../../../core/services/AuthService';
import { MesaService } from '../../../auth/services/mesa.service';
import { DetalleProducto, ItemPedido, PedidoRequest } from '../../../auth/models/pedidos.model';
import { PedidoService } from '../../../auth/services/pedidos.service';

@Component({
  selector: 'app-comanda-pedido',
  templateUrl: './comanda-pedido.component.html',
  styleUrls: ['./comanda-pedido.component.scss']
})
export class ComandaPedidoComponent implements OnInit {

  // Propiedades existentes
  mesa: string = '';
  categoriaSeleccionada: number = 1;
  itemsPedido: ItemPedido[] = [];
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  numeroPersonas: number = 1;
  observacionGeneral: string = '';
  dataSource = new MatTableDataSource<Categoria>();
  dataSourceProducto = new MatTableDataSource<Producto>();
  mozoLogeado: string = '';

  // NUEVAS PROPIEDADES PARA MODO EDICIÓN
  pedidoID: number | null = null;
  modoEdicion: boolean = false;
  estadoPedido: string = '';
  cargandoPedido: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriService: CategoriService,
    private productoService: ProductoService,
    private authService: AuthService,
    private mesaService: MesaService,
    private pedidoService: PedidoService
  ) { }

  ngOnInit(): void {
    // MODIFICADO: Verificar si es modo edición
    this.route.paramMap.subscribe(params => {
      this.mesa = params.get('mesa') || 'MESA 01';
      this.pedidoID = params.get('pedidoId') ? Number(params.get('pedidoId')) : null;
      this.modoEdicion = this.pedidoID !== null;

      // Si es modo edición, cargar datos después de cargar productos
      if (this.modoEdicion && this.productos.length > 0) {
        this.cargarPedidoParaEditar();
      }
    });

    this.mozoLogeado = this.authService.getUsername();
    this.listarCategoria();
    this.listarProducto();
  }

  listarCategoria(): void {
    this.categoriService.listarCategoria().subscribe({
      next: (categorias: Categoria[]) => {
        console.log('Categorías recibidas:', categorias);
        this.categorias = categorias;
        this.dataSource.data = categorias;
      },
      error: () => Swal.fire('Error', 'No se pudo cargar las categorías', 'error')
    });
  }

  listarProducto(): void {
    this.productoService.listarProducto().subscribe({
      next: (productos: Producto[]) => {
        console.log('Productos recibidos:', productos);
        this.productos = productos;
        this.dataSourceProducto.data = productos;
        
        // NUEVO: Si es modo edición y ya tenemos productos, cargar el pedido
        if (this.modoEdicion && this.pedidoID) {
          this.cargarPedidoParaEditar();
        }
      },
      error: () => Swal.fire('Error', 'No se pudo cargar los productos', 'error')
    });
  }

  // NUEVO MÉTODO: Cargar pedido para editar
  cargarPedidoParaEditar(): void {
    if (!this.pedidoID) return;

    this.cargandoPedido = true;

    this.pedidoService.obtenerPedidoParaEditar(this.pedidoID).subscribe({
      next: (datos) => {
        console.log('Datos del pedido para editar:', datos);
        
        if (datos && datos.length > 0) {
          // Los datos del pedido están en la primera fila
          const primerRegistro = datos[0];
          
          // Cargar datos de la cabecera
          this.mesa = primerRegistro.Mesa;
          this.mozoLogeado = primerRegistro.Mozo;
          this.numeroPersonas = primerRegistro.NumeroPersonas;
          this.observacionGeneral = primerRegistro.Observaciones || '';
          this.estadoPedido = primerRegistro.Estado;

          // Construir itemsPedido desde los datos
          this.itemsPedido = datos.map(item => {
            // Buscar el producto completo en la lista de productos
            const productoCompleto = this.productos.find(p => p.productId === item.productoID);
            
            return {
              producto: productoCompleto || {
                productId: item.productoID,
                productName: item.nombreProducto,
                productPryce: item.precioUnitario,
                categoryId: 1, 
                productDescription: '',
                productimg: '',
                categoryname: '',
                productRegisterDate: new Date(),
                stateproduct: true
              } as Producto,
              cantidad: item.cantidad,
              subtotal: item.subtotal
            };
          });

          console.log('Items del pedido cargados:', this.itemsPedido);
        }
        
        this.cargandoPedido = false;
      },
      error: (error) => {
        console.error('Error al cargar pedido:', error);
        this.cargandoPedido = false;
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el pedido para editar',
          confirmButtonText: 'Volver'
        }).then(() => {
          this.router.navigate(['/comanda']);
        });
      }
    });
  }

  // NUEVOS GETTERS
  get tituloComponente(): string {
    return this.modoEdicion ? `Editar Pedido #${this.pedidoID}` : 'Nuevo Pedido';
  }

  get estadoMesa(): string {
    return this.modoEdicion ? `Editando - ${this.estadoPedido}` : 'Nuevo Pedido';
  }

  get puedeEditar(): boolean {
    if (!this.modoEdicion) return true; 
    return this.estadoPedido === 'Pendiente' || this.estadoPedido === 'En Preparación';
  }

  // Métodos existentes (sin cambios)
  get productosFiltrados(): Producto[] {
    return this.productos.filter(p => p.categoryId === this.categoriaSeleccionada);
  }

  get totalPedido(): number {
    return this.itemsPedido.reduce((total, item) => total + item.subtotal, 0);
  }

  get cantidadTotalItems(): number {
    return this.itemsPedido.reduce((total, item) => total + item.cantidad, 0);
  }

  seleccionarCategoria(categoriaId: number): void {
    this.categoriaSeleccionada = categoriaId;
  }

  agregarProducto(producto: Producto): void {
    // NUEVO: Verificar si se puede editar
    if (this.modoEdicion && !this.puedeEditar) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede editar',
        text: 'Solo se pueden editar pedidos en estado Pendiente o En Preparación'
      });
      return;
    }

    const itemExistente = this.itemsPedido.find(item => item.producto.productId === producto.productId);

    if (itemExistente) {
      itemExistente.cantidad++;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.producto.productPryce;
    } else {
      this.itemsPedido.push({
        producto: producto,
        cantidad: 1,
        subtotal: producto.productPryce
      });
    }
  }

  actualizarCantidad(index: number, nuevaCantidad: number): void {
    // NUEVO: Verificar si se puede editar
    if (this.modoEdicion && !this.puedeEditar) return;

    if (nuevaCantidad <= 0) {
      this.eliminarItem(index);
      return;
    }

    this.itemsPedido[index].cantidad = nuevaCantidad;
    this.itemsPedido[index].subtotal = nuevaCantidad * this.itemsPedido[index].producto.productPryce;
  }

  eliminarItem(index: number): void {
    // NUEVO: Verificar si se puede editar
    if (this.modoEdicion && !this.puedeEditar) return;
    
    this.itemsPedido.splice(index, 1);
  }

  // MÉTODO MODIFICADO: guardarPedido
  guardarPedido(): void {
    if (this.itemsPedido.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Pedido vacío',
        text: 'Debe agregar al menos un producto al pedido',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    // NUEVO: Verificar si se puede editar
    if (this.modoEdicion && !this.puedeEditar) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede editar',
        text: 'Solo se pueden editar pedidos en estado Pendiente o En Preparación',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (!this.numeroPersonas || this.numeroPersonas < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Número de Personas inválido',
        text: 'Número de personas inválido',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    const detalleJSON: DetalleProducto[] = this.itemsPedido.map(item => ({
      productoID: item.producto.productId,
      nombreProducto: item.producto.productName,
      cantidad: item.cantidad,
      precioUnitario: item.producto.productPryce
    }));

    // MODIFICADO: Títulos según el modo
    const titulo = this.modoEdicion ? '¿Actualizar pedido?' : '¿Confirmar pedido?';
    const textoConfirm = this.modoEdicion ? 'Sí, actualizar pedido' : 'Sí, confirmar pedido';

    Swal.fire({
      title: titulo,
      html: `
        <div style="text-align: left; margin: 1rem 0;">
          <p><strong>Mesa:</strong> ${this.mesa}</p>
          <p><strong>Mozo:</strong> ${this.mozoLogeado}</p>
          <p><strong>Personas:</strong> ${this.numeroPersonas}</p>
          <p><strong>Total:</strong> ${this.formatearMoneda(this.totalPedido)}</p>
          <p><strong>Artículos:</strong> ${this.cantidadTotalItems} items</p>
          ${this.modoEdicion ? `<p><strong>Pedido ID:</strong> ${this.pedidoID}</p>` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      confirmButtonText: textoConfirm,
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.modoEdicion) {
          this.actualizarPedido(detalleJSON);
        } else {
          this.procesarPedidoNuevo(detalleJSON);
        }
      }
    });
  }

  // NUEVO MÉTODO: Actualizar pedido
  private actualizarPedido(detalleJSON: DetalleProducto[]): void {
    const pedidoActualizado = {
      pedidoID: this.pedidoID,
      mesa: this.mesa,
      mozo: this.mozoLogeado,
      numeroPersonas: this.numeroPersonas,
      observaciones: this.observacionGeneral || null,
      detalleJSON: detalleJSON
    };

    Swal.fire({
      title: 'Actualizando pedido...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.pedidoService.actualizarPedido(pedidoActualizado).subscribe({
      next: (response) => {
        console.log('Pedido actualizado:', response);
        
        Swal.fire({
          icon: 'success',
          title: 'Pedido actualizado',
          html: `
            <div style="text-align: center;">
              <p>El pedido se actualizó correctamente</p>
              <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <p style="margin: 0;"><strong>Pedido ID:</strong> ${response.pedidoID}</p>
                <p style="margin: 0;"><strong>Nuevo Total:</strong> ${this.formatearMoneda(response.total)}</p>
              </div>
            </div>
          `,
          confirmButtonText: 'Volver a mesas',
          confirmButtonColor: '#4f46e5',
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          this.router.navigate(['/comanda']);
        });
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: error.error?.mensaje || 'Ocurrió un error inesperado',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc2626'
        });
      }
    });
  }

  // MÉTODO RENOMBRADO: procesarPedidoNuevo (era procesarPedido)
  private procesarPedidoNuevo(detalleJSON: DetalleProducto[]): void {
    const pedidoRequest: PedidoRequest = {
      mesa: this.mesa,
      mozo: this.mozoLogeado,
      numeroPersonas: this.numeroPersonas,
      observaciones: this.observacionGeneral || null,
      detalleJSON: detalleJSON
    };

    Swal.fire({
      title: 'Guardando pedido...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.pedidoService.guardarPedido(pedidoRequest).subscribe({
      next: (response) => {
        console.log('Pedido guardado:', response);
        
        this.cambiarEstadoMesa();
        
        Swal.fire({
          icon: 'success',
          title: '¡Pedido confirmado!',
          html: `
            <div style="text-align: center;">
              <p>El pedido ha sido registrado correctamente</p>
              <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <p style="margin: 0;"><strong>Pedido ID:</strong> ${response.pedidoID}</p>
                <p style="margin: 0;"><strong>Total:</strong> ${this.formatearMoneda(response.total)}</p>
                <p style="margin: 0;"><strong>${this.mesa}</strong> ahora está <span style="color: #dc2626;">OCUPADA</span></p>
              </div>
            </div>
          `,
          confirmButtonText: 'Volver a mesas',
          confirmButtonColor: '#4f46e5',
          timer: 4000,
          timerProgressBar: true
        }).then(() => {
          this.router.navigate(['/comanda']);
        });
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar pedido',
          text: error.error?.mensaje || 'Ocurrió un error inesperado',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc2626'
        });
      }
    });
  }

  // Métodos existentes (sin cambios)
  private cambiarEstadoMesa(): void {
    if (this.modoEdicion) return; // No cambiar estado si es edición
    
    console.log('Cambiando estado de mesa a OCUPADO:', this.mesa);

    this.mesaService.actualizarMesaOcupada(this.mesa).subscribe({
      next: () => {
        console.log(`✅ ${this.mesa} cambiada a estado OCUPADO en BD`);
      },
      error: (error) => {
        console.error('❌ Error al actualizar estado de mesa:', error);
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'El pedido se guardó pero hubo un problema al actualizar el estado de la mesa',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b'
        });
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/comanda']);
  }

  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  getNombreCategoria(): string {
    const categoria = this.categorias.find(c => c.categoryId === this.categoriaSeleccionada);
    return categoria ? categoria.nameCategory : 'Selecciona categoría';
  }

  getColorCategoria(categoryId: number): string {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
      '#eb4d4b', '#6ab04c', '#7ed6df', '#e056fd', '#686de0'
    ];
    return colors[categoryId % colors.length];
  }
}