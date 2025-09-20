import { Component, OnInit } from '@angular/core';
import { ProveedoresService } from '../../../auth/services/proveedores.service';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})

export class ProveedoresComponent implements OnInit {

  proveedores: any[] = [];
  
  cargando = true;
  error: string | null = null;
  
  mostrarModal = false;
  editando = false;
  proveedorSeleccionado: any = null;
  
  filtros = {
    nombre: '',
    ruc: '',
    estado: 'todos'
  };

  nuevoProveedor: any = this.crearProveedorVacio();

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    this.proveedoresService.listarProveedores().subscribe({
      next: (proveedores: any) => {
        this.proveedores = proveedores;
        this.cargando = false;
      },
      error: (error) => {
        this.error = 'Error al cargar proveedores';
        this.cargando = false;
      }
    });
  }

  get proveedoresFiltrados(): any[] {
    return this.proveedores.filter(prov => {
      const cumpleFiltroNombre = !this.filtros.nombre || 
        prov.supplierName.toLowerCase().includes(this.filtros.nombre.toLowerCase());
      const cumpleFiltroRuc = !this.filtros.ruc || 
        prov.ruc.includes(this.filtros.ruc);
      const cumpleFiltroEstado = this.filtros.estado === 'todos' || 
        (this.filtros.estado === 'activos' && prov.status) ||
        (this.filtros.estado === 'inactivos' && !prov.status);

      return cumpleFiltroNombre && cumpleFiltroRuc && cumpleFiltroEstado;
    });
  }

  abrirModalNuevo(): void {
    this.editando = false;
    this.proveedorSeleccionado = null;
    this.nuevoProveedor = this.crearProveedorVacio();
    this.mostrarModal = true;
  }

  abrirModalEditar(proveedor: any): void {
    this.editando = true;
    this.proveedorSeleccionado = { ...proveedor };
    this.nuevoProveedor = { ...proveedor };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.nuevoProveedor = this.crearProveedorVacio();
  }

  private crearProveedorVacio(): any {
    return {
      supplierName: '',
      ruc: '',
      phone: '',
      address: '',
      status: true
    };
  }

  guardarProveedor(): void {
    if (this.validarFormulario()) {
      if (this.editando && this.proveedorSeleccionado) {
        this.proveedoresService.actualizarProveedor(this.proveedorSeleccionado.supplierId, this.nuevoProveedor).subscribe({
          next: (response) => {
            console.log('Proveedor actualizado:', response);
            this.cargarDatos();
            this.cerrarModal();
          },
          error: (error) => {
            this.error = 'Error al actualizar proveedor';
          }
        });
      } else {
        this.proveedoresService.guardarProveedor(this.nuevoProveedor).subscribe({
          next: (response) => {
            console.log('Proveedor guardado:', response);
            this.cargarDatos();
            this.cerrarModal();
          },
          error: (error) => {
            this.error = 'Error al guardar proveedor';
          }
        });
      }
    }
  }

  eliminarProveedor(proveedor: any): void {
    if (confirm(`¿Está seguro de eliminar al proveedor ${proveedor.supplierName}?`)) {
      this.proveedoresService.eliminarProveedor(proveedor.supplierId).subscribe({
        next: (response) => {
          console.log('Proveedor eliminado:', response);
          this.cargarDatos();
        },
        error: (error) => {
          this.error = 'Error al eliminar proveedor';
        }
      });
    }
  }

  cambiarEstadoProveedor(proveedor: any): void {
    proveedor.status = !proveedor.status;
    this.proveedoresService.actualizarProveedor(proveedor.supplierId, proveedor).subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response);
      },
      error: (error) => {
        this.error = 'Error al cambiar estado';
        proveedor.status = !proveedor.status;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.nuevoProveedor.supplierName.trim()) {
      alert('El nombre del proveedor es requerido');
      return false;
    }
    if (!this.nuevoProveedor.ruc.trim()) {
      alert('El RUC es requerido');
      return false;
    }
    if (this.nuevoProveedor.ruc.length !== 11) {
      alert('El RUC debe tener 11 dígitos');
      return false;
    }
    return true;
  }
}