
export interface Turno {
  shiftId: number;
  nameshift: string;
  startTime: string; // formato: HH:mm
  endTime: string;    // formato: HH:mm
  stateshift?: boolean;
}
