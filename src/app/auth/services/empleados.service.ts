// empleados.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Empleado, Persona, Cargo, Turno, EmpleadoCompleto } from '../models/empleado.model';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  private API_URL = 'http://localhost:8080/api/empleados';

  constructor(private http: HttpClient) { }

  listarEmpleados(): Observable<EmpleadoCompleto[]> {
    const empleados: EmpleadoCompleto[] = [
      {
        empleado: {
          nEmpleadoId: 1,
          nPersonaId: 1,
          nCargoId: 1,
          fechaIngreso: '2024-01-15',
          bactivo: true
        },
        persona: {
          nPersonaId: 1,
          cNombres: 'Juan Carlos',
          cApePaterno: 'García',
          cApeMaterno: 'López',
          dFechaNacimiento: '1990-05-15',
          cDireccion: 'Av. Principal 123',
          cTelefono: '987654321',
          cDni: '12345678',
          cCorreo: 'juan.garcia@lacantera.com'
        },
        cargo: {
          nCargoId: 1,
          cCargoCod: 'CHEF',
          cNombreCargo: 'Chef Principal',
          cDescripcion: 'Encargado de la cocina principal',
          nSueldo: 2500.00,
          bEstado: true
        }
      },
      {
        empleado: {
          nEmpleadoId: 2,
          nPersonaId: 2,
          nCargoId: 2,
          fechaIngreso: '2024-02-01',
          bactivo: true
        },
        persona: {
          nPersonaId: 2,
          cNombres: 'María Elena',
          cApePaterno: 'Rodríguez',
          cApeMaterno: 'Silva',
          dFechaNacimiento: '1995-08-22',
          cDireccion: 'Jr. Los Olivos 456',
          cTelefono: '965432187',
          cDni: '87654321',
          cCorreo: 'maria.rodriguez@lacantera.com'
        },
        cargo: {
          nCargoId: 2,
          cCargoCod: 'MOZO',
          cNombreCargo: 'Mozo',
          cDescripcion: 'Atención al cliente',
          nSueldo: 1200.00,
          bEstado: true
        }
      },
      {
        empleado: {
          nEmpleadoId: 3,
          nPersonaId: 3,
          nCargoId: 3,
          fechaIngreso: '2023-11-10',
          bactivo: false
        },
        persona: {
          nPersonaId: 3,
          cNombres: 'Pedro Luis',
          cApePaterno: 'Martínez',
          cApeMaterno: 'Vargas',
          dFechaNacimiento: '1988-12-03',
          cDireccion: 'Calle Lima 789',
          cTelefono: '912345678',
          cDni: '11223344',
          cCorreo: 'pedro.martinez@lacantera.com'
        },
        cargo: {
          nCargoId: 3,
          cCargoCod: 'CAJERO',
          cNombreCargo: 'Cajero',
          cDescripcion: 'Manejo de caja y pagos',
          nSueldo: 1500.00,
          bEstado: true
        }
      }
    ];
    
    return of(empleados);
  }

  listarCargos(): Observable<Cargo[]> {
    const cargos: Cargo[] = [
      {
        nCargoId: 1,
        cCargoCod: 'CHEF',
        cNombreCargo: 'Chef Principal',
        cDescripcion: 'Encargado de la cocina principal',
        nSueldo: 2500.00,
        bEstado: true
      },
      {
        nCargoId: 2,
        cCargoCod: 'MOZO',
        cNombreCargo: 'Mozo',
        cDescripcion: 'Atención al cliente',
        nSueldo: 1200.00,
        bEstado: true
      },
      {
        nCargoId: 3,
        cCargoCod: 'CAJERO',
        cNombreCargo: 'Cajero',
        cDescripcion: 'Manejo de caja y pagos',
        nSueldo: 1500.00,
        bEstado: true
      },
      {
        nCargoId: 4,
        cCargoCod: 'ADMIN',
        cNombreCargo: 'Administrador',
        cDescripcion: 'Administración general',
        nSueldo: 3000.00,
        bEstado: true
      }
    ];
    
    return of(cargos);
  }

  listarTurnos(): Observable<Turno[]> {
    const turnos: Turno[] = [
      {
        nTurnoId: 1,
        cNombre: 'Mañana',
        tHoraInicio: '07:00',
        tHoraFin: '15:00',
        bEstado: true
      },
      {
        nTurnoId: 2,
        cNombre: 'Tarde',
        tHoraInicio: '15:00',
        tHoraFin: '23:00',
        bEstado: true
      },
      {
        nTurnoId: 3,
        cNombre: 'Noche',
        tHoraInicio: '23:00',
        tHoraFin: '07:00',
        bEstado: true
      }
    ];
    
    return of(turnos);
  }

  guardarEmpleado(empleadoCompleto: EmpleadoCompleto): Observable<any> {
    console.log('Guardando empleado:', empleadoCompleto);
    return of({ success: true, message: 'Empleado guardado correctamente' });
  }

  actualizarEmpleado(id: number, empleadoCompleto: EmpleadoCompleto): Observable<any> {
    console.log('Actualizando empleado:', id, empleadoCompleto);
    return of({ success: true, message: 'Empleado actualizado correctamente' });
  }

  eliminarEmpleado(id: number): Observable<any> {
    console.log('Eliminando empleado:', id);
    return of({ success: true, message: 'Empleado eliminado correctamente' });
  }
}