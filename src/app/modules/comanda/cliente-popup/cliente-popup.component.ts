import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ClientePopupData {
  cliente?: Cliente | null;
}

export interface Cliente {
  dni: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
}


@Component({
  selector: 'app-cliente-popup',
  templateUrl: './cliente-popup.component.html',
  styleUrl: './cliente-popup.component.scss'
})


export class ClientePopupComponent {
  clienteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClientePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientePopupData
  ) {
    this.clienteForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{9}$/)]]
    });

    // Si hay datos del cliente, cargarlos en el formulario
    if (this.data?.cliente) {
      this.clienteForm.patchValue(this.data.cliente);
    }
  }

  guardarCliente(): void {
    if (this.clienteForm.valid) {
      const cliente: Cliente = {
        dni: this.clienteForm.value.dni,
        nombre: this.clienteForm.value.nombre.trim(),
        apellido: this.clienteForm.value.apellido.trim(),
        email: this.clienteForm.value.email?.trim() || undefined,
        telefono: this.clienteForm.value.telefono?.trim() || undefined
      };

      this.dialogRef.close(cliente);
    }
  }
}