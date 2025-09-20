import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/AuthService';

@Component({
  selector: 'app-comanda',
  template: `<router-outlet></router-outlet>`
})
export class ComandaComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const cargoCod = this.authService.getCargoCod();

    if (cargoCod === '00001') {
      this.router.navigate(['/comanda/admin']);
    } else if (cargoCod === '00002') {
      this.router.navigate(['/comanda/cocina']);
    } else if (cargoCod === '00003') {
      this.router.navigate(['/comanda/mozos']);
    } else {
      this.router.navigate(['/']); // otro → dashboard
    }
  }
}
