import { Component } from '@angular/core';

@Component({
  selector: 'app-comanda-cocina',
  templateUrl: './comanda-cocina.component.html',
  styleUrls: ['./comanda-cocina.component.scss']
})
export class ComandaCocinaComponent {

  pedidosMesas = [
    {
      mesa: 'MESA 03',
      hora: '14:00',
      estado: 'En preparación',
      items: ['Pollo a la brasa', 'Inka Cola 1L']
    },
    {
      mesa: 'MESA 04',
      hora: '13:45',
      estado: 'Pendiente',
      items: ['1/2 Pollo', 'Papas grandes']
    }
  ];
}
