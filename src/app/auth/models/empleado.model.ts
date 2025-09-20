export interface Persona {
  nPersonaId?: number;
  cNombres: string;
  cApePaterno: string;
  cApeMaterno: string;
  dFechaNacimiento?: string;
  cDireccion?: string;
  cTelefono?: string;
  cDni: string;
  cCorreo?: string;
}

export interface Empleado {
  nEmpleadoId?: number;
  nPersonaId: number;
  nCargoId: number;
  fechaIngreso?: string;
  bactivo: boolean;
  
  // Datos combinados para vista
  nombreCompleto?: string;
  nombreCargo?: string;
  persona?: Persona;
  cargo?: Cargo;
}

export interface Cargo {
  nCargoId?: number;
  cCargoCod?: string;
  cNombreCargo: string;
  cDescripcion?: string;
  nSueldo?: number;
  bEstado: boolean;
}

export interface Turno {
  nTurnoId?: number;
  cNombre: string;
  tHoraInicio: string;
  tHoraFin: string;
  bEstado: boolean;
  // Agregar estas propiedades que faltan
  shiftId?: number;
  nameShift?: string;
  startTime?: string;
  endTime?: string;
}
export interface EmpleadoCompleto {
  empleado: Empleado;
  persona: Persona;
  cargo: Cargo;
}
