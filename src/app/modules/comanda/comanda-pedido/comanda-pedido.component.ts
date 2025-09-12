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

interface ItemPedido {
  producto: Producto;
  cantidad: number;
  subtotal: number;
  observacion?: string;
}

@Component({
  selector: 'app-comanda-pedido',
  templateUrl: './comanda-pedido.component.html',
  styleUrls: ['./comanda-pedido.component.scss']
})
export class ComandaPedidoComponent implements OnInit {

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

  previewImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriService: CategoriService,
    private productoService: ProductoService,
    private authService: AuthService,
    private mesaService: MesaService
  ) { }

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
      },
      error: () => Swal.fire('Error', 'No se pudo cargar los productos', 'error')
    });
  }

  mozoSeleccionado = 1;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.mesa = params.get('mesa') || 'MESA 01';
    });

    this.mozoLogeado = this.authService.getUsername();
    this.listarCategoria();
    this.listarProducto();
  }

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
    if (nuevaCantidad <= 0) {
      this.eliminarItem(index);
      return;
    }

    this.itemsPedido[index].cantidad = nuevaCantidad;
    this.itemsPedido[index].subtotal = nuevaCantidad * this.itemsPedido[index].producto.productPryce;
  }

  eliminarItem(index: number): void {
    this.itemsPedido.splice(index, 1);
  }

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

    Swal.fire({
      title: '¿Confirmar pedido?',
      html: `
        <div style="text-align: left; margin: 1rem 0;">
          <p><strong>Mesa:</strong> ${this.mesa}</p>
          <p><strong>Mozo:</strong> ${this.mozoLogeado}</p>
          <p><strong>Personas:</strong> ${this.numeroPersonas}</p>
          <p><strong>Total:</strong> ${this.formatearMoneda(this.totalPedido)}</p>
          <p><strong>Artículos:</strong> ${this.cantidadTotalItems} items</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Sí, confirmar pedido',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarPedido();
      }
    });
  }

  private procesarPedido(): void {
    const pedido = {
      mesa: this.mesa,
      mozo: this.mozoLogeado,
      numeroPersonas: this.numeroPersonas,
      items: this.itemsPedido,
      total: this.totalPedido,
      observacion: this.observacionGeneral,
      fecha: new Date(),
      estado: 'Ocupado'
    };

    console.log('Pedido guardado:', pedido);

    this.cambiarEstadoMesa();

    Swal.fire({
      icon: 'success',
      title: '¡Pedido confirmado!',
      html: `
        <div style="text-align: center;">
          <p>El pedido ha sido registrado correctamente</p>
          <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <p style="margin: 0;"><strong>${this.mesa}</strong> ahora está <span style="color: #dc2626;">OCUPADA</span></p>
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
  }

  private cambiarEstadoMesa(): void {
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