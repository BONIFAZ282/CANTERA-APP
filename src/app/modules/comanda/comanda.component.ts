import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comanda',
  templateUrl: './comanda.component.html',
  styleUrls: ['./comanda.component.scss']
})



export class ComandaComponent implements OnInit {

  perfil: 'mozo' | 'cocina' | 'admin' = 'mozo';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.redirigirPorPerfil();
  }

  redirigirPorPerfil() {
    switch (this.perfil) {
      case 'mozo':
        this.router.navigate(['comanda/mozos']);
        break;
      case 'cocina':
        this.router.navigate(['comanda/cocina']);
        break;
      case 'admin':
        this.router.navigate(['comanda/admin']);
        break;
    }
  }
}