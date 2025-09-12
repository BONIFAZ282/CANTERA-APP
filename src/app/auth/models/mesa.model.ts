export interface Mesa {
  tableId: number;
  tableCode: string;
  tableBusy?: boolean; // 1=Ocupado, 0=Libre, 2=Reservado
  username: string;
  stateTable: boolean;

}