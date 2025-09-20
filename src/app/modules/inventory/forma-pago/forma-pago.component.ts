import { Component, OnInit } from '@angular/core';
import { FormaPagoService } from '../../../auth/services/forma-pago.service';
@Component({
  selector: 'app-forma-pago',
  templateUrl: './forma-pago.component.html',
  styleUrls: ['./forma-pago.component.scss']
})
export class FormaPagoComponent implements OnInit {

  formasPago: any[] = [];
  
  cargando = true;
  error: string | null = null;
  
  mostrarModal = false;
  editando = false;
  formaPagoSeleccionada: any = null;
  
  filtros = {
    nombre: '',
    estado: 'todos'
  };

  nuevaFormaPago: any = this.crearFormaPagoVacia();

  constructor(private formaPagoService: FormaPagoService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    this.formaPagoService.listarFormasPago().subscribe({
      next: (formasPago: any) => {
        this.formasPago = formasPago;
        this.cargando = false;
      },
      error: (error) => {
        this.error = 'Error al cargar formas de pago';
        this.cargando = false;
      }
    });
  }

  get formasPagoFiltradas(): any[] {
    return this.formasPago.filter(forma => {
      const cumpleFiltroNombre = !this.filtros.nombre || 
        forma.cNombreFormaPago.toLowerCase().includes(this.filtros.nombre.toLowerCase());
      const cumpleFiltroEstado = this.filtros.estado === 'todos' || 
        (this.filtros.estado === 'activos' && forma.bEstado) ||
        (this.filtros.estado === 'inactivos' && !forma.bEstado);

      return cumpleFiltroNombre && cumpleFiltroEstado;
    });
  }

  abrirModalNueva(): void {
    this.editando = false;
    this.formaPagoSeleccionada = null;
    this.nuevaFormaPago = this.crearFormaPagoVacia();
    this.mostrarModal = true;
  }

  abrirModalEditar(formaPago: any): void {
    this.editando = true;
    this.formaPagoSeleccionada = { ...formaPago };
    this.nuevaFormaPago = { ...formaPago };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.nuevaFormaPago = this.crearFormaPagoVacia();
  }

  private crearFormaPagoVacia(): any {
    return {
      cNombreFormaPago: '',
      cImagen: '',
      bEstado: true
    };
  }

  guardarFormaPago(): void {
    if (this.validarFormulario()) {
      if (this.editando && this.formaPagoSeleccionada) {
        this.formaPagoService.actualizarFormaPago(this.formaPagoSeleccionada.nFormaPagoId, this.nuevaFormaPago).subscribe({
          next: (response) => {
            console.log('Forma de pago actualizada:', response);
            this.cargarDatos();
            this.cerrarModal();
          },
          error: (error) => {
            this.error = 'Error al actualizar forma de pago';
          }
        });
      } else {
        this.formaPagoService.guardarFormaPago(this.nuevaFormaPago).subscribe({
          next: (response) => {
            console.log('Forma de pago guardada:', response);
            this.cargarDatos();
            this.cerrarModal();
          },
          error: (error) => {
            this.error = 'Error al guardar forma de pago';
          }
        });
      }
    }
  }

  eliminarFormaPago(formaPago: any): void {
    if (confirm(`¿Está seguro de eliminar la forma de pago ${formaPago.cNombreFormaPago}?`)) {
      this.formaPagoService.eliminarFormaPago(formaPago.nFormaPagoId).subscribe({
        next: (response) => {
          console.log('Forma de pago eliminada:', response);
          this.cargarDatos();
        },
        error: (error) => {
          this.error = 'Error al eliminar forma de pago';
        }
      });
    }
  }

  cambiarEstadoFormaPago(formaPago: any): void {
    formaPago.bEstado = !formaPago.bEstado;
    this.formaPagoService.actualizarFormaPago(formaPago.nFormaPagoId, formaPago).subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response);
      },
      error: (error) => {
        this.error = 'Error al cambiar estado';
        formaPago.bEstado = !formaPago.bEstado;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.nuevaFormaPago.cNombreFormaPago.trim()) {
      alert('El nombre de la forma de pago es requerido');
      return false;
    }
    return true;
  }
}