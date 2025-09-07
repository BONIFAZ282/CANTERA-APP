import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabGroup } from '@angular/material/tabs';
import { CargoService } from '../../../auth/services/cargo.service';
import { Cargo } from '../../../auth/models/cargo.model';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cargos',
  templateUrl: './cargos.component.html',
  styleUrls: ['./cargos.component.scss']
})
export class CargosComponent implements OnInit {
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  cargoForm!: FormGroup;
  modoEdicion = false;
  idEnEdicion: number | null = null;
  isLoading = false;

  columnas: string[] = ['nombre', 'descripcion', 'sueldo', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Cargo>([]);

  constructor(private fb: FormBuilder, private cargoService: CargoService) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.listarCargos();
  }

  get totalCargos(): number {
    return this.dataSource.data.length;
  }

  get cargosActivos(): number {
    return this.dataSource.data.filter(c => c.stateCargue).length;
  }

  inicializarFormulario(): void {
    this.cargoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      sueldo: [0, [Validators.min(0)]],
      estado: [true]
    });
  }

  listarCargos(): void {
    this.isLoading = true;
    this.cargoService.listarCargos()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: cargos => this.dataSource.data = cargos,
        error: err => console.error('Error al listar cargos', err)
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  guardarCargo(): void {
    if (this.cargoForm.invalid) return;

    const formValue = this.cargoForm.value;
    const cargo: Cargo = {
      idcharge: this.idEnEdicion ?? 0,
      nameCargue: formValue.nombre,
      descriptioncargue: formValue.descripcion,
      salary: formValue.sueldo
    };

    if (this.modoEdicion && this.idEnEdicion !== null) {
      this.cargoService.actualizarCargo(cargo).subscribe({
        next: () => {
          this.listarCargos();
          this.cancelar();
          Swal.fire('Actualización exitosa', 'El cargo ha sido actualizado correctamente.', 'success');
        },
        error: err => console.error('Error al actualizar cargo', err)
      });
    } else {
      this.cargoService.registrarCargo(cargo).subscribe({
        next: () => {
          this.listarCargos();
          this.cancelar();
          Swal.fire('Registro exitoso', 'El cargo ha sido registrado correctamente.', 'success');
        },
        error: err => console.error('Error al registrar cargo', err)
      });
    }
  }

  editarCargo(cargo: Cargo): void {
    this.modoEdicion = true;
    this.idEnEdicion = cargo.idcharge;
    this.cargoForm.patchValue({
      nombre: cargo.nameCargue,
      descripcion: cargo.descriptioncargue,
      sueldo: cargo.salary
    });

    this.switchToRegistroTab();
  }


  eliminarCargo(cargo: Cargo): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.cargoService.eliminarCargo(cargo.idcharge).subscribe({
          next: () => {
            this.listarCargos();
            Swal.fire('Eliminado', 'El cargo fue desactivado correctamente.', 'success');
          },
          error: err => {
            console.error('Error al desactivar el cargo', err);
            Swal.fire('Error', 'No se pudo desactivar el cargo.', 'error');
          }
        });
      }
    });
  }


  switchToRegistroTab(): void {
    if (this.tabGroup) {
      this.tabGroup.selectedIndex = 0;
    }
  }

  limpiarFormulario(): void {
    this.cargoForm.reset({ estado: true, sueldo: 0 });
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.idEnEdicion = null;
    this.limpiarFormulario();
  }
}
