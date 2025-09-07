import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.scss']
})
export class EmpleadosComponent implements OnInit {
  formEmpleado!: FormGroup;
  modoEdicion = false;
  idEnEdicion: number | null = null;
  selectedTabIndex = 0; // Para controlar las tabs
  
  // Columnas de la tabla
  columnas: string[] = ['dni', 'nombres', 'cargo', 'estado', 'acciones'];
  
  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>();
  
  // Lista de cargos disponibles
  cargos: string[] = ['Gerente', 'Chef', 'Mesero', 'Cajero', 'Limpieza'];
  
  // Datos de ejemplo (reemplazar con datos reales del servicio)
  empleados: any[] = [
    { id: 1, dni: '12345678', nombres: 'Juan Pérez', cargo: 'Chef', estado: true },
    { id: 2, dni: '87654321', nombres: 'María García', cargo: 'Mesero', estado: true },
    { id: 3, dni: '11223344', nombres: 'Carlos López', cargo: 'Cajero', estado: false },
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDatos();
  }

  inicializarFormulario(): void {
    this.formEmpleado = this.fb.group({
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      nombres: ['', Validators.required],
      cargo: ['', Validators.required],
      estado: [true]
    });
  }

  cargarDatos(): void {
    // Aquí cargarías los datos del servicio
    this.dataSource.data = this.empleados;
  }

  registrarEmpleado(): void {
    if (this.formEmpleado.invalid) return;

    const formValue = this.formEmpleado.value;
    
    if (this.modoEdicion) {
      // Actualizar empleado existente
      const index = this.empleados.findIndex(emp => emp.id === this.idEnEdicion);
      if (index !== -1) {
        this.empleados[index] = {
          ...this.empleados[index],
          dni: formValue.dni,
          nombres: formValue.nombres,
          cargo: formValue.cargo,
          estado: formValue.estado
        };
      }
    } else {
      // Crear nuevo empleado
      const nuevoEmpleado = {
        id: this.empleados.length + 1, // En producción usar ID del backend
        dni: formValue.dni,
        nombres: formValue.nombres,
        cargo: formValue.cargo,
        estado: formValue.estado
      };
      this.empleados.push(nuevoEmpleado);
    }

    this.dataSource.data = [...this.empleados];
    this.cancelar();
    // Cambiar a la tab del listado para ver el resultado
    this.selectedTabIndex = 1;
  }

  editarEmpleado(empleado: any): void {
    this.formEmpleado.patchValue({
      dni: empleado.dni,
      nombres: empleado.nombres,
      cargo: empleado.cargo,
      estado: empleado.estado
    });
    this.modoEdicion = true;
    this.idEnEdicion = empleado.id;
    // Cambiar a la tab del formulario para editar
    this.selectedTabIndex = 0;
  }

  eliminarEmpleado(id: number): void {
    // Aquí podrías agregar SweetAlert para confirmación
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      this.empleados = this.empleados.filter(emp => emp.id !== id);
      this.dataSource.data = [...this.empleados];
    }
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.idEnEdicion = null;
    this.formEmpleado.reset({ estado: true });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Método original que mantenías para compatibilidad
  buscarEmpleados(): any[] {
    return this.empleados;
  }
}