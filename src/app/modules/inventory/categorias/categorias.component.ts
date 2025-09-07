import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { Categoria } from '../../../auth/models/categoria.model';
import { CategoriService } from '../../../auth/services/caterogia.service';


@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent {
  categoriaForm!: FormGroup;
  modoEdicion = false;
  idEnEdicion: number | null = null;
  columnas: string[] = ['nombre', 'descripcion', 'imagen', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Categoria>();

  selectedTabIndex = 0; // 0 = Formulario, 1 = Listado

  previewImage: string | null = null;

  constructor(private fb: FormBuilder, private categoriService: CategoriService) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.listarCategoria();
  }

  inicializarFormulario(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen: ['', Validators.required],
      estado: [true]
    });
  }


  listarCategoria(): void {
    this.categoriService.listarCategoria().subscribe({
      next: categoria => {
        console.log('Categorías recibidas:', categoria); // 👈 aquí va tu log
        this.dataSource.data = categoria;
      },
      error: () => Swal.fire('Error', 'No se pudo cargar las categorías', 'error')
    });
  }


  guardarCategoria(): void {
    if (this.categoriaForm.invalid) return;

    const formValue = this.categoriaForm.value;
    const categoria: Categoria = {
      categoryId: this.idEnEdicion ?? 0,
      nameCategory: formValue.nombre,
      descriptionCategory: formValue.descripcion,
      imageCategory: formValue.imagen,
      stateCategory: formValue.estado
    };

    const request = this.modoEdicion
      ? this.categoriService.actualizarCategoria(categoria)
      : this.categoriService.registrarCategoria(categoria);

    request.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Categoria ${this.modoEdicion ? 'actualizado' : 'registrado'} correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        this.listarCategoria();
        this.cancelar();
        this.selectedTabIndex = 1;
      },
      error: () => Swal.fire('Error', 'No se pudo guardar la categoria', 'error')
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


editarCategoria(categoria: Categoria): void {
  this.categoriaForm.patchValue({
    nombre: categoria.nameCategory,
    descripcion: categoria.descriptionCategory,
    imagen: categoria.imageCategory,
    estado: categoria.stateCategory
  });
  this.previewImage = categoria.imageCategory;
  this.modoEdicion = true;
  this.idEnEdicion = categoria.categoryId;
  this.selectedTabIndex = 0;
}



  eliminarCategoria(categoria: Categoria): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás la Categoria "${categoria.categoryId}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.categoriService.eliminarCategoria(categoria.categoryId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Categoria eliminado correctamente', 'success');
            this.listarCategoria();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el Categoria', 'error')
        });
      }
    });
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.idEnEdicion = null;
    this.categoriaForm.reset({ estado: true });
    this.selectedTabIndex = 1;
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      this.categoriaForm.patchValue({ imagen: base64 });
      this.previewImage = base64;
      console.log('Imagen base64:', base64);
    };

    reader.readAsDataURL(file);
  }


}
