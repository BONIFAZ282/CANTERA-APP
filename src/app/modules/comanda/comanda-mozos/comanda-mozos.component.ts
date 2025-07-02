import { Component } from '@angular/core';

@Component({
  selector: 'app-comanda-mozos',
  templateUrl: './comanda-mozos.component.html',
  styleUrls: ['./comanda-mozos.component.scss']
})
export class ComandaMozosComponent {
  filtroEstado = 'Todos';
  busqueda = '';

  ambientes = [
    {
      nombre: 'Ambiente 1',
      piso: 1,
      mesas: [
        { nombre: 'MESA 01', estado: 'Disponible' },
        { nombre: 'MESA 02', estado: 'Ocupado', fecha: '2025-06-29T14:00:00', usuario: 'Mozo 1' },
      ]
    },
    {
      nombre: 'Ambiente 2',
      piso: 2,
      mesas: [
        { nombre: 'MESA 03', estado: 'Disponible' },
        { nombre: 'MESA 04', estado: 'Ocupado', fecha: '2025-06-29T13:30:00', usuario: 'Mozo 2' },
      ]
    }
  ];

  takeawayOrders = [
    {
      numero: 101,
      cliente: 'Juan Pérez',
      estado: 'Preparando',
      horaEstimada: '12:30 PM',
      total: 25.00,
      items: 3
    },
    {
      numero: 102,
      cliente: 'Ana Gómez',
      estado: 'Listo',
      horaEstimada: '12:45 PM',
      total: 18.50,
      items: 2
    }
  ];

  deliveryOrders = [
    {
      numero: 201,
      cliente: 'Carlos Ruiz',
      telefono: '987654321',
      estado: 'Preparando',
      direccion: 'Av. Perú 123',
      zona: 'Centro',
      tiempoEstimado: 30,
      total: 42.00,
      repartidor: '',
      items: 4
    },
    {
      numero: 202,
      cliente: 'Lucía Torres',
      telefono: '912345678',
      estado: 'En Camino',
      direccion: 'Jr. Ayacucho 456',
      zona: 'Sur',
      tiempoEstimado: 20,
      total: 35.00,
      repartidor: 'Pedro',
      items: 3
    }
  ];


  getDeliveryIcon(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'preparando':
        return 'restaurant';
      case 'en camino':
        return 'motorcycle';
      case 'entregado':
        return 'check_circle';
      default:
        return 'help_outline';
    }
  }


  mesasFiltradas(mesas: any[]) {
    return mesas.filter(m => {
      const coincideBusqueda = m.nombre.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = this.filtroEstado === 'Todos' ||
        (this.filtroEstado === 'Disponible' && m.estado === 'Disponible') ||
        (this.filtroEstado === 'Ocupado' && m.estado !== 'Disponible');
      return coincideBusqueda && coincideEstado;
    });
  }

  minutosOcupado(fechaStr: string): number {
    const ocupada = new Date(fechaStr).getTime();
    const ahora = Date.now();
    return Math.floor((ahora - ocupada) / 60000);
  }
}
