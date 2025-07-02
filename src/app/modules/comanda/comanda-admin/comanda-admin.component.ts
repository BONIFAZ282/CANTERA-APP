import { Component } from '@angular/core';

@Component({
  selector: 'app-comanda-admin',
  templateUrl: './comanda-admin.component.html',
  styleUrls: ['./comanda-admin.component.scss']
})
export class ComandaAdminComponent {
  pedidosActivos = 8;
  pedidosLlevar = 3;
  pedidosDelivery = 4;
  pedidosEntregados = 10;
}
