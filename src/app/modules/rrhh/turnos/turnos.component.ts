import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { TurnoService } from '../../../auth/services/turno.service';
import { Turno } from '../../../auth/models/turno.model';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.scss']
})
export class TurnosComponent implements OnInit {
  turnoForm!: FormGroup;
  modoEdicion = false;
  idEnEdicion: number | null = null;
  columnas: string[] = ['nombre', 'horaInicio', 'horaFin', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Turno>();
  
  selectedTabIndex = 0; // 0 = Formulario, 1 = Listado

  constructor(private fb: FormBuilder, private turnoService: TurnoService) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.listarTurnos();
  }

  inicializarFormulario(): void {
    this.turnoForm = this.fb.group({
      nombre: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      estado: [true]
    });
  }

  listarTurnos(): void {
    this.turnoService.listarTurnos().subscribe({
      next: turnos => this.dataSource.data = turnos,
      error: () => Swal.fire('Error', 'No se pudo cargar los turnos', 'error')
    });
  }

  guardarTurno(): void {
    if (this.turnoForm.invalid) return;

    const formValue = this.turnoForm.value;
    const turno: Turno = {
      shiftId: this.idEnEdicion ?? 0,
      nameshift: formValue.nombre,
      startTime: formValue.horaInicio,
      endTime: formValue.horaFin
    };

    const request = this.modoEdicion
      ? this.turnoService.actualizarTurno(turno)
      : this.turnoService.registrarTurno(turno);

    request.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Turno ${this.modoEdicion ? 'actualizado' : 'registrado'} correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        this.listarTurnos();
        this.cancelar();
        this.selectedTabIndex = 1;
      },
      error: () => Swal.fire('Error', 'No se pudo guardar el turno', 'error')
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editarTurno(turno: Turno): void {
    this.turnoForm.patchValue({
      nombre: turno.nameshift,
      horaInicio: turno.startTime,
      horaFin: turno.endTime
    });
    this.modoEdicion = true;
    this.idEnEdicion = turno.shiftId;
    this.selectedTabIndex = 0;
  }

  eliminarTurno(turno: Turno): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás el turno "${turno.nameshift}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.turnoService.eliminarTurno(turno.shiftId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Turno eliminado correctamente', 'success');
            this.listarTurnos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el turno', 'error')
        });
      }
    });
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.idEnEdicion = null;
    this.turnoForm.reset({ estado: true });
    this.selectedTabIndex = 1;
  }
}