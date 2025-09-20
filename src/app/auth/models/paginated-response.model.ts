export interface PaginatedResponse<T> {
  data: T[];
  totalRegistros: number;
  paginaActual: number;
  tamanioPagina: number;
  totalPaginas: number;
  success: boolean;
  mensaje?: string;
}