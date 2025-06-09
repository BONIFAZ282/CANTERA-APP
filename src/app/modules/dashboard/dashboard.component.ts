import { Component, AfterViewInit } from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  private initCharts(): void {
    const lineCanvas = document.getElementById('ventasLineChart') as HTMLCanvasElement;
    if (lineCanvas) {
      new Chart(lineCanvas, {
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Ventas (S/.)',
            data: [850, 920, 780, 1020, 1200, 1350, 1280],
            fill: true,
            borderColor: '#7B1C1C',
            backgroundColor: 'rgba(123, 28, 28, 0.2)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Gráfico de torta - ventas por categoría
    const doughnutCanvas = document.getElementById('ventasChart') as HTMLCanvasElement;
    if (doughnutCanvas) {
      new Chart(doughnutCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Pollo', 'Bebidas', 'Guarniciones', 'Extras'],
          datasets: [{
            data: [450, 120, 200, 80],
            backgroundColor: ['#E53935', '#FDD835', '#43A047', '#1E88E5']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }
}