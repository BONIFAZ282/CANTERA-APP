import { Component, OnInit } from '@angular/core';
import { CategoriaInsumo } from '../../../auth/models/categoriaInsumo.model';
import { Insumo } from '../../../auth/models/insumo.model';
import { CategoriaInsumoService } from '../../../auth/services/categoria-insumo.service';

import Swal from 'sweetalert2';
import { InsumoService } from '../../../auth/services/insumo.service';

@Component({
  selector: 'app-admin-insumos',
  templateUrl: './admin-insumos.component.html',
  styleUrls: ['./admin-insumos.component.scss']
})
export class AdminInsumosComponent implements OnInit {

  vista: 'categorias' | 'insumos' = 'categorias';
  categoriaSeleccionada: CategoriaInsumo | null = null;
  mostrarModalCategoria: boolean = false;
  mostrarModalInsumo: boolean = false;
  editandoCategoria: CategoriaInsumo | null = null;
  editandoInsumo: Insumo | null = null;

  // Datos desde el backend - INICIALMENTE VACÍOS
  categoriasInsumos: CategoriaInsumo[] = [];
  insumos: Insumo[] = [];

  formCategoria: Partial<CategoriaInsumo> = {
    inputcategoryname: '',
    inputcategorydescription: '',
    inputcategoryimg: '',
    stateinputcategory: true
  };

  formInsumo: Partial<Insumo> = {
    supplyName: '',
    unitOfMeasure: '',
    currentStock: 0,
    supplyImg: '',
    status: true
  };

  unidadesMedida: string[] = ['Kg', 'Litros', 'Unidades', 'Gramos', 'Ml'];

  constructor(
    private categoriaInsumoService: CategoriaInsumoService,
    private insumoService: InsumoService
  ) { }

  ngOnInit(): void {
    this.cargarCategoriasInsumos();
    this.cargarInsumos();
  }

  // Métodos para cargar datos
  cargarCategoriasInsumos(): void {
    this.categoriaInsumoService.listarCategoriaInsumos().subscribe({
      next: (categorias) => {
        this.categoriasInsumos = categorias.map(cat => ({
          ...cat,
          stateinputcategory: Boolean(cat.stateinputcategory)
        }));
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las categorías de insumos', 'error');
      }
    });
  }

  cargarInsumos(): void {
    this.insumoService.listarInsumos().subscribe({
      next: (insumos) => {
        this.insumos = insumos.map(ins => ({
          ...ins,
          status: Boolean(ins.status)
        }));
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los insumos', 'error');
      }
    });
  }

  // Métodos para categorías
  abrirModalCategoria(categoria: CategoriaInsumo | null = null): void {
    if (categoria) {
      this.editandoCategoria = categoria;
      this.formCategoria = { ...categoria };
    } else {
      this.editandoCategoria = null;
      this.formCategoria = {
        inputcategoryname: '',
        inputcategorydescription: '',
        inputcategoryimg: '',  // ← AGREGA ESTE CAMPO
        stateinputcategory: true
      };
    }
    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria(): void {
    this.mostrarModalCategoria = false;
    this.editandoCategoria = null;
  }

  guardarCategoria(): void {
    if (!this.formCategoria.inputcategoryname || !this.formCategoria.inputcategorydescription) {
      Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
      return;
    }

    const categoriaParaEnviar = {
      inputcategoryId: this.editandoCategoria?.inputcategoryId || 0,
      inputcategoryname: this.formCategoria.inputcategoryname!,
      inputcategorydescription: this.formCategoria.inputcategorydescription!,
      inputcategoryimg: this.formCategoria.inputcategoryimg || ''
    };

    const request = this.editandoCategoria
      ? this.categoriaInsumoService.actualizarCategoriaInsumo(categoriaParaEnviar)
      : this.categoriaInsumoService.registrarCategoriaInsumo(categoriaParaEnviar);

    request.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Categoría ${this.editandoCategoria ? 'actualizada' : 'registrada'} correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        this.cargarCategoriasInsumos();
        this.cerrarModalCategoria();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar la categoría', 'error');
      }
    });
  }

  eliminarCategoria(categoria: CategoriaInsumo): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás la categoría "${categoria.inputcategoryname}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.categoriaInsumoService.eliminarCategoriaInsumo(categoria.inputcategoryId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Categoría eliminada correctamente', 'success');
            this.cargarCategoriasInsumos();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
          }
        });
      }
    });
  }

  // Métodos para insumos
  abrirModalInsumo(insumo: Insumo | null = null): void {
    if (insumo) {
      this.editandoInsumo = insumo;
      this.formInsumo = { ...insumo };
    } else {
      this.editandoInsumo = null;
      this.formInsumo = {
        supplyName: '',
        unitOfMeasure: '',
        currentStock: 0,
        supplyImg: '',
        status: true
      };
    }
    this.mostrarModalInsumo = true;
  }

  cerrarModalInsumo(): void {
    this.mostrarModalInsumo = false;
    this.editandoInsumo = null;
  }

  guardarInsumo(): void {
    if (!this.formInsumo.supplyName || !this.formInsumo.unitOfMeasure || !this.categoriaSeleccionada) {
      Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
      return;
    }

    const insumoParaEnviar = {
      supplyId: this.editandoInsumo?.supplyId || 0,
      supplyCategoryId: this.categoriaSeleccionada.inputcategoryId,
      supplyName: this.formInsumo.supplyName!,
      unitOfMeasure: this.formInsumo.unitOfMeasure!,
      currentStock: this.formInsumo.currentStock || 0,
      supplyImg: this.formInsumo.supplyImg || ''
    };

    const request = this.editandoInsumo
      ? this.insumoService.actualizarInsumo(insumoParaEnviar)
      : this.insumoService.registrarInsumo(insumoParaEnviar);

    request.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Insumo ${this.editandoInsumo ? 'actualizado' : 'registrado'} correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        this.cargarInsumos();
        this.cerrarModalInsumo();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar el insumo', 'error');
      }
    });
  }

  eliminarInsumo(insumo: Insumo): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás el insumo "${insumo.supplyName}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.insumoService.eliminarInsumo(insumo.supplyId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Insumo eliminado correctamente', 'success');
            this.cargarInsumos();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el insumo', 'error');
          }
        });
      }
    });
  }

  // Métodos de navegación
  verInsumos(categoria: CategoriaInsumo): void {
    this.categoriaSeleccionada = categoria;
    this.vista = 'insumos';
  }

  volverACategorias(): void {
    this.vista = 'categorias';
    this.categoriaSeleccionada = null;
  }

  // Getters
  get todasLasCategoriasInsumos(): CategoriaInsumo[] {
    return this.categoriasInsumos;
  }

  get todosLosInsumosDeCategoria(): Insumo[] {
    if (!this.categoriaSeleccionada) return [];
    return this.insumos.filter(
      ins => ins.supplyCategoryId === this.categoriaSeleccionada!.inputcategoryId
    );
  }

  // Método para obtener clase de stock
  getStockClass(stock: number): string {
    if (stock > 20) return 'stock-alto';
    if (stock > 10) return 'stock-medio';
    return 'stock-bajo';
  }

  // Método para obtener texto de stock
  getStockText(stock: number): string {
    if (stock > 20) return 'Alto';
    if (stock > 10) return 'Medio';
    return 'Bajo';
  }
  // Métodos para manejo de imágenes
  onFileSelected(event: any, tipo: 'categoria' | 'insumo'): void {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file, tipo);
    }
  }

  convertToBase64(file: File, tipo: 'categoria' | 'insumo'): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      if (tipo === 'categoria') {
        this.formCategoria.inputcategoryimg = base64String;
      } else {
        this.formInsumo.supplyImg = base64String;
      }
    };
    reader.readAsDataURL(file);
  }

  limpiarImagen(tipo: 'categoria' | 'insumo'): void {
    if (tipo === 'categoria') {
      this.formCategoria.inputcategoryimg = '';
    } else {
      this.formInsumo.supplyImg = '';
    }
  }
}