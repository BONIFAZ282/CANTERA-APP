import { Component, OnInit } from '@angular/core';
import { Categoria } from '../../../auth/models/categoria.model';
import { Producto } from '../../../auth/models/producto.model';
import { CategoriService } from '../../../auth/services/caterogia.service';

import Swal from 'sweetalert2';
import { ProductoService } from '../../../auth/services/producto.service';

@Component({
  selector: 'app-admin-categorias-productos',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent implements OnInit {

  vista: 'categorias' | 'productos' = 'categorias';
  categoriaSeleccionada: Categoria | null = null;
  mostrarModalCategoria: boolean = false;
  mostrarModalProducto: boolean = false;
  editandoCategoria: Categoria | null = null;
  editandoProducto: Producto | null = null;

  categorias: Categoria[] = [];
  productos: Producto[] = [];

  formCategoria: Partial<Categoria> = {
    nameCategory: '',
    descriptionCategory: '',
    imageCategory: '',
    stateCategory: true
  };

  formProducto: Partial<Producto> = {
    productName: '',
    productDescription: '',
    productimg: '',
    productPryce: 0,
    stateproduct: true
  };

  constructor(
    private categoriaService: CategoriService,
    private productoService: ProductoService
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.categoriaService.listarCategoria().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
      }
    });
  }

  cargarProductos(): void {
    this.productoService.listarProducto().subscribe({
      next: (productos) => {
        this.productos = productos;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      }
    });
  }

  abrirModalCategoria(categoria: Categoria | null = null): void {
    if (categoria) {
      this.editandoCategoria = categoria;
      this.formCategoria = { ...categoria };
    } else {
      this.editandoCategoria = null;
      this.formCategoria = {
        nameCategory: '',
        descriptionCategory: '',
        imageCategory: '',
        stateCategory: true
      };
    }
    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria(): void {
    this.mostrarModalCategoria = false;
    this.editandoCategoria = null;
  }

  guardarCategoria(): void {
    if (!this.formCategoria.nameCategory || !this.formCategoria.descriptionCategory) {
      Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
      return;
    }

    const categoria: Categoria = {
      categoryId: this.editandoCategoria?.categoryId || 0,
      nameCategory: this.formCategoria.nameCategory!,
      descriptionCategory: this.formCategoria.descriptionCategory!,
      imageCategory: this.formCategoria.imageCategory || '',
      stateCategory: this.formCategoria.stateCategory ?? true
    };

    const request = this.editandoCategoria
      ? this.categoriaService.actualizarCategoria(categoria)
      : this.categoriaService.registrarCategoria(categoria);

    request.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Categoría ${this.editandoCategoria ? 'actualizada' : 'registrada'} correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        this.cargarCategorias();
        this.cerrarModalCategoria();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar la categoría', 'error');
      }
    });
  }

  eliminarCategoria(categoria: Categoria): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás la categoría "${categoria.nameCategory}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.categoriaService.eliminarCategoria(categoria.categoryId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Categoría eliminada correctamente', 'success');
            this.cargarCategorias();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
          }
        });
      }
    });
  }

  abrirModalProducto(producto: Producto | null = null): void {
    if (producto) {
      this.editandoProducto = producto;
      this.formProducto = { ...producto };
    } else {
      this.editandoProducto = null;
      this.formProducto = {
        productName: '',
        productDescription: '',
        productimg: '',
        productPryce: 0,
        stateproduct: true
      };
    }
    this.mostrarModalProducto = true;
  }

  cerrarModalProducto(): void {
    this.mostrarModalProducto = false;
    this.editandoProducto = null;
  }

  guardarProducto(): void {
    if (!this.formProducto.productName || !this.formProducto.productDescription || !this.categoriaSeleccionada) {
      Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
      return;
    }

    const productoParaEnviar = {
      productId: this.editandoProducto?.productId || 0,
      categoryId: this.categoriaSeleccionada.categoryId,
      productName: this.formProducto.productName!,
      productDescription: this.formProducto.productDescription!,
      productimg: this.formProducto.productimg || '',
      productPryce: this.formProducto.productPryce || 0
    };

    const request = this.editandoProducto
      ? this.productoService.actualizarProducto(productoParaEnviar as any)
      : this.productoService.registrarProducto(productoParaEnviar as any);

    request.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Producto ${this.editandoProducto ? 'actualizado' : 'registrado'} correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        this.cargarProductos();
        this.cerrarModalProducto();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar el producto', 'error');
      }
    });
  }

  eliminarProducto(producto: Producto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás el producto "${producto.productName}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.productoService.eliminarProducto(producto.productId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
            this.cargarProductos();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
          }
        });
      }
    });
  }

  verProductos(categoria: Categoria): void {
    this.categoriaSeleccionada = categoria;
    this.vista = 'productos';
  }

  volverACategorias(): void {
    this.vista = 'categorias';
    this.categoriaSeleccionada = null;
  }

  get todasLasCategorias(): Categoria[] {
    return this.categorias;
  }

  get todosLosProductosDeCategoria(): Producto[] {
    if (!this.categoriaSeleccionada) return [];
    return this.productos.filter(
      prod => prod.categoryId === this.categoriaSeleccionada!.categoryId // Mostrar todos, no solo los activos
    );
  }

  onFileSelected(event: any, tipo: 'categoria' | 'producto'): void {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file, tipo);
    }
  }

  convertToBase64(file: File, tipo: 'categoria' | 'producto'): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      if (tipo === 'categoria') {
        this.formCategoria.imageCategory = base64String;
      } else {
        this.formProducto.productimg = base64String;
      }
    };
    reader.readAsDataURL(file);
  }

  limpiarImagen(tipo: 'categoria' | 'producto'): void {
    if (tipo === 'categoria') {
      this.formCategoria.imageCategory = '';
    } else {
      this.formProducto.productimg = '';
    }
  }

  isBase64Image(data: string): boolean {
    return data.startsWith('data:image/');
  }
}