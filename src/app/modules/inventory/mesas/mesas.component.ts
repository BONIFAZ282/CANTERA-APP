import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { Mesa } from '../../../auth/models/mesa.model';
import { MesaService } from '../../../auth/services/mesa.service';


@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.component.html',
  styleUrl: './mesas.component.scss'
})
export class MesasComponent {
  mesaForm!: FormGroup;
  modoEdicion = false;
  idEnEdicion: number | null = null;
  columnas: string[] = ['nombre', 'descripcion', 'imagen', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Mesa>();

  selectedTabIndex = 0; // 0 = Formulario, 1 = Listado

  previewImage: string | null = null;

  constructor(private fb: FormBuilder, private mesaService: MesaService) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.listarCategoria();
  }

  inicializarFormulario(): void {
    this.mesaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen: ['', Validators.required],
      estado: [true]
    });
  }


  listarCategoria(): void {
    this.mesaService.listarMesa().subscribe({
      next: mesa => {
        console.log('Categorías recibidas:', mesa); // 👈 aquí va tu log
        this.dataSource.data = mesa;
      },
      error: () => Swal.fire('Error', 'No se pudo cargar las categorías', 'error')
    });
  }


  // guardarCategoria(): void {
  //   if (this.mesaForm.invalid) return;

  //   const formValue = this.mesaForm.value;
  //   const mesa: Mesa = {
  //     tableId: this.idEnEdicion ?? 0,
  //     tableCode: formValue.nombre,
  //     tableBusy: formValue.descripcion,
  //     stateCategory: formValue.imagen
  //   };

  //   const request = this.modoEdicion
  //     ? this.mesaService.actualizarMesa(mesa)
  //     : this.mesaService.registrarMesa(mesa);

  //   request.subscribe({
  //     next: () => {
  //       Swal.fire({
  //         icon: 'success',
  //         title: `Mesa ${this.modoEdicion ? 'actualizado' : 'registrado'} correctamente`,
  //         timer: 1500,
  //         showConfirmButton: false
  //       });
  //       this.listarCategoria();
  //       this.cancelar();
  //       this.selectedTabIndex = 1;
  //     },
  //     error: () => Swal.fire('Error', 'No se pudo guardar la mesa', 'error')
  //   });
  // }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  editarCategoria(mesa: Mesa): void {
    this.mesaForm.patchValue({
      tableCode: mesa.tableCode
    });
    this.previewImage = mesa.tableCode
  }


  eliminarCategoria(mesa: Mesa): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás la Mesa "${mesa.tableId}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.mesaService.eliminarMesa(mesa.tableId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Mesa eliminado correctamente', 'success');
            this.listarCategoria();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el Mesa', 'error')
        });
      }
    });
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.idEnEdicion = null;
    this.mesaForm.reset({ estado: true });
    this.selectedTabIndex = 1;
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      this.mesaForm.patchValue({ imagen: base64 });
      this.previewImage = base64;
      console.log('Imagen base64:', base64);
    };

    reader.readAsDataURL(file);
  }


}
