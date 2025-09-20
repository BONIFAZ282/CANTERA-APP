import { Component, OnInit } from '@angular/core';
import { EmpleadoCompleto } from '../../../auth/models/empleado.model';
import { Cargo } from '../../../auth/models/cargo.model';
import { Turno } from '../../../auth/models/turno.model';
import { EmpleadosService } from '../../../auth/services/empleados.service';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.scss']
})
export class EmpleadosComponent implements OnInit {

  empleados: EmpleadoCompleto[] = [];
cargos: any[] = [];
turnos: any[] = [];  
  cargando = true;
  error: string | null = null;
  
  mostrarModal = false;
  editando = false;
  empleadoSeleccionado: EmpleadoCompleto | null = null;
  
  filtros = {
    nombre: '',
    cargo: '',
    estado: 'todos'
  };

  nuevoEmpleado: EmpleadoCompleto = this.crearEmpleadoVacio();

  constructor(private empleadosService: EmpleadosService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    this.empleadosService.listarEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        this.cargando = false;
      },
      error: (error) => {
        this.error = 'Error al cargar empleados';
        this.cargando = false;
      }
    });

    this.empleadosService.listarCargos().subscribe({
      next: (cargos) => {
        this.cargos = cargos;
      }
    });

    this.empleadosService.listarTurnos().subscribe({
      next: (turnos) => {
        this.turnos = turnos;
      }
    });
  }

  get empleadosFiltrados(): EmpleadoCompleto[] {
    return this.empleados.filter(emp => {
      const nombreCompleto = `${emp.persona.cNombres} ${emp.persona.cApePaterno} ${emp.persona.cApeMaterno}`.toLowerCase();
      const cumpleFiltroNombre = !this.filtros.nombre || nombreCompleto.includes(this.filtros.nombre.toLowerCase());
      const cumpleFiltroCargo = !this.filtros.cargo || emp.cargo.cNombreCargo === this.filtros.cargo;
      const cumpleFiltroEstado = this.filtros.estado === 'todos' || 
        (this.filtros.estado === 'activos' && emp.empleado.bactivo) ||
        (this.filtros.estado === 'inactivos' && !emp.empleado.bactivo);

      return cumpleFiltroNombre && cumpleFiltroCargo && cumpleFiltroEstado;
    });
  }

  abrirModalNuevo(): void {
    this.editando = false;
    this.empleadoSeleccionado = null;
    this.nuevoEmpleado = this.crearEmpleadoVacio();
    this.mostrarModal = true;
  }

  abrirModalEditar(empleado: EmpleadoCompleto): void {
    this.editando = true;
    this.empleadoSeleccionado = { ...empleado };
    this.nuevoEmpleado = JSON.parse(JSON.stringify(empleado));
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.nuevoEmpleado = this.crearEmpleadoVacio();
  }

  private crearEmpleadoVacio(): EmpleadoCompleto {
    return {
      empleado: {
        nPersonaId: 0,
        nCargoId: 0,
        fechaIngreso: new Date().toISOString().split('T')[0],
        bactivo: true
      },
      persona: {
        cNombres: '',
        cApePaterno: '',
        cApeMaterno: '',
        cDni: '',
        cTelefono: '',
        cCorreo: '',
        cDireccion: '',
        dFechaNacimiento: ''
      },
      cargo: {
        nCargoId: 0,
        cNombreCargo: '',
        bEstado: true
      }
    };
  }

  guardarEmpleado(): void {
    if (this.validarFormulario()) {
      if (this.editando && this.empleadoSeleccionado) {
        this.empleadosService.actualizarEmpleado(this.empleadoSeleccionado.empleado.nEmpleadoId!, this.nuevoEmpleado).subscribe({
          next: (response) => {
            console.log('Empleado actualizado:', response);
            this.cargarDatos();
            this.cerrarModal();
          },
          error: (error) => {
            this.error = 'Error al actualizar empleado';
          }
        });
      } else {
        this.empleadosService.guardarEmpleado(this.nuevoEmpleado).subscribe({
          next: (response) => {
            console.log('Empleado guardado:', response);
            this.cargarDatos();
            this.cerrarModal();
          },
          error: (error) => {
            this.error = 'Error al guardar empleado';
          }
        });
      }
    }
  }

  eliminarEmpleado(empleado: EmpleadoCompleto): void {
    if (confirm(`¿Está seguro de eliminar al empleado ${empleado.persona.cNombres} ${empleado.persona.cApePaterno}?`)) {
      this.empleadosService.eliminarEmpleado(empleado.empleado.nEmpleadoId!).subscribe({
        next: (response) => {
          console.log('Empleado eliminado:', response);
          this.cargarDatos();
        },
        error: (error) => {
          this.error = 'Error al eliminar empleado';
        }
      });
    }
  }

  cambiarEstadoEmpleado(empleado: EmpleadoCompleto): void {
    empleado.empleado.bactivo = !empleado.empleado.bactivo;
    this.empleadosService.actualizarEmpleado(empleado.empleado.nEmpleadoId!, empleado).subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response);
      },
      error: (error) => {
        this.error = 'Error al cambiar estado';
        empleado.empleado.bactivo = !empleado.empleado.bactivo;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.nuevoEmpleado.persona.cNombres.trim()) {
      alert('El nombre es requerido');
      return false;
    }
    if (!this.nuevoEmpleado.persona.cApePaterno.trim()) {
      alert('El apellido paterno es requerido');
      return false;
    }
    if (!this.nuevoEmpleado.persona.cDni.trim()) {
      alert('El DNI es requerido');
      return false;
    }
    if (this.nuevoEmpleado.persona.cDni.length !== 8) {
      alert('El DNI debe tener 8 dígitos');
      return false;
    }
    if (!this.nuevoEmpleado.empleado.nCargoId) {
      alert('Debe seleccionar un cargo');
      return false;
    }
    return true;
  }

  // Método para obtener nombre del cargo
obtenerNombreCargo(cargo: any): string {
  return cargo.cNombreCargo || '';
}

// Método para obtener sueldo del cargo
obtenerSueldoCargo(cargo: any): number {
  return cargo.nSueldo || 0;
}

onCargoChange(): void {
  const cargoId = Number(this.nuevoEmpleado.empleado.nCargoId);
  const cargoSeleccionado: any = this.cargos.find((c: any) => c.nCargoId === cargoId);
  if (cargoSeleccionado) {
    this.nuevoEmpleado.cargo = {
      nCargoId: cargoSeleccionado.nCargoId,
      cNombreCargo: cargoSeleccionado.cNombreCargo,
      cDescripcion: cargoSeleccionado.cDescripcion,
      nSueldo: cargoSeleccionado.nSueldo,
      bEstado: true
    };
  }
}

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor || 0);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-PE');
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }
}