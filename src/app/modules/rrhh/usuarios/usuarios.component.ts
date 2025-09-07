import { Component } from '@angular/core';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent {
  preview: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.preview = reader.result;
        const base64 = (reader.result as string).split(',')[1]; // solo el string base64 sin encabezado
        console.log('Base64:', base64);
      };

      reader.readAsDataURL(file); // convierte a base64
    }
  }

  base64Manual: string = ''; // Aquí va el base64 (puedes ponerlo en duro también)
  imagenBase64: string | null = null;

  mostrarImagen(): void {
    if (this.base64Manual) {
      this.imagenBase64 = this.base64Manual;
      console.log('Mostrando imagen desde Base64:', this.base64Manual);
    }
  }


}
