import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../auth/services/usuario.service';
import { AuthService } from '../../../core/services/AuthService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar si ya está autenticado
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/comanda']);
    }

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const toggleIcon = document.getElementById('toggleIcon') as HTMLElement;
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Swal.fire('Error', 'Por favor, ingresa un usuario y contraseña válidos.', 'error');
      return;
    }

    const { username, password } = this.loginForm.value;
    this.usuarioService.verificarUsuario(username, password)
      .subscribe({
        next: (data) => {
          if (data) {
            // Guardar usuario en el servicio global
            this.authService.guardarUsuario(data);
            
            // Login exitoso
            Swal.fire('Éxito', `¡Bienvenido ${data.username}!`, 'success');
            this.router.navigate(['/comanda']);
          }
        },
        error: (error) => {
          console.log('Error status:', error.status);
          
          if (error.status === 401) {
            Swal.fire('Error', 'Usuario o contraseña incorrectos.', 'error');
          } else if (error.status === 500) {
            Swal.fire('Error', 'Error en el servidor. Intenta más tarde.', 'error');
          } else if (error.status === 0) {
            Swal.fire('Error', 'No se puede conectar al servidor.', 'error');
          } else {
            Swal.fire('Error', 'Hubo un problema con la conexión. Intenta nuevamente.', 'error');
          }
        }
      });
  }
}