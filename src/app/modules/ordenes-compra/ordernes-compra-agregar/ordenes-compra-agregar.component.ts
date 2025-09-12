import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

interface Proveedor {
  id: number;
  nombre: string;
}

interface Insumo {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-ordenes-compra-agregar',
  templateUrl: './ordenes-compra-agregar.component.html',
  styleUrls: ['./ordenes-compra-agregar.component.scss']
})
export class OrdenesCompraAgregarComponent implements OnInit {

  ordenForm: FormGroup;
  proveedores: Proveedor[] = [];
  insumos: Insumo[] = [];
  esEdicion: boolean = false;
  ordenId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.ordenForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarDatosMock();
    this.verificarEdicion();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nProveedorId: ['', Validators.required],
      dFecha: [new Date().toISOString().split('T')[0], Validators.required],
      nEstado: ['Pendiente', Validators.required],
      detalles: this.fb.array([])
    });
  }

  get detallesArray(): FormArray {
    return this.ordenForm.get('detalles') as FormArray;
  }

  cargarDatosMock(): void {
    this.proveedores = [
      { id: 1, nombre: 'Proveedor A' },
      { id: 2, nombre: 'Proveedor B' },
      { id: 3, nombre: 'Proveedor C' }
    ];

    this.insumos = [
      { id: 1, nombre: 'Harina' },
      { id: 2, nombre: 'Azúcar' },
      { id: 3, nombre: 'Aceite' },
      { id: 4, nombre: 'Sal' },
      { id: 5, nombre: 'Mantequilla' },
      { id: 6, nombre: 'Huevos' }
    ];
  }

  verificarEdicion(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.ordenId = parseInt(id, 10);
      this.cargarOrdenParaEditar(this.ordenId);
    } else {
      this.agregarDetalle(); // Agregar al menos un detalle por defecto
    }
  }

  cargarOrdenParaEditar(id: number): void {
    // Simular carga de datos para edición
    const ordenMock = {
      id: 1,
      nProveedorId: 1,
      dFecha: '2024-01-15',
      nEstado: 'Pendiente',
      detalles: [
        { nInsumoId: 1, nCantidad: 50, nPrecioUnitario: 15.00 },
        { nInsumoId: 2, nCantidad: 25, nPrecioUnitario: 20.02 }
      ]
    };

    // Cargar datos en el formulario
    this.ordenForm.patchValue({
      nProveedorId: ordenMock.nProveedorId,
      dFecha: ordenMock.dFecha,
      nEstado: ordenMock.nEstado
    });

    // Cargar detalles
    ordenMock.detalles.forEach(detalle => {
      this.detallesArray.push(this.crearDetalleFormGroup(detalle));
    });
  }

  crearDetalleFormGroup(detalle?: any): FormGroup {
    return this.fb.group({
      nInsumoId: [detalle?.nInsumoId || '', Validators.required],
      nCantidad: [detalle?.nCantidad || '', [Validators.required, Validators.min(0.01)]],
      nPrecioUnitario: [detalle?.nPrecioUnitario || '', [Validators.required, Validators.min(0.01)]]
    });
  }

  agregarDetalle(): void {
    this.detallesArray.push(this.crearDetalleFormGroup());
  }

  eliminarDetalle(index: number): void {
    if (this.detallesArray.length > 1) {
      this.detallesArray.removeAt(index);
    }
  }

  calcularSubtotal(detalle: any): number {
    const cantidad = detalle.get('nCantidad')?.value || 0;
    const precio = detalle.get('nPrecioUnitario')?.value || 0;
    return cantidad * precio;
  }

  calcularTotal(): number {
    let total = 0;
    this.detallesArray.controls.forEach(detalle => {
      total += this.calcularSubtotal(detalle);
    });
    return total;
  }

  onSubmit(): void {
    if (this.ordenForm.valid && this.detallesArray.length > 0) {
      const ordenData = {
        ...this.ordenForm.value,
        nTotal: this.calcularTotal(),
        id: this.ordenId
      };

      console.log('Datos de la orden:', ordenData);
      
      // Aquí iría la llamada al backend
      if (this.esEdicion) {
        console.log('Actualizando orden...');
        // Llamada para actualizar
      } else {
        console.log('Creando nueva orden...');
        // Llamada para crear
      }

      // Redirigir al listado
      this.router.navigate(['/ordenes-compra']);
    } else {
      console.log('Formulario inválido');
      this.marcarCamposComoTocados();
    }
  }

  marcarCamposComoTocados(): void {
    this.ordenForm.markAllAsTouched();
    this.detallesArray.controls.forEach(control => {
      control.markAllAsTouched();
    });
  }

  cancelar(): void {
    this.router.navigate(['/ordenes-compra']);
  }

  getNombreInsumo(insumoId: number): string {
    const insumo = this.insumos.find(i => i.id === insumoId);
    return insumo ? insumo.nombre : '';
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }
}