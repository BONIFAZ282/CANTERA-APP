
// dashboard.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
import { DashboardData } from '../../../auth/models/dashboard.model';
import { DashboardService } from '../../../auth/services/dashboard.service';

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
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  dashboardData: DashboardData | null = null;
  cargando = true;
  error: string | null = null;

  // Filtros de fecha
  fechaSeleccionada: string = '';
  opcionesFecha = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'ayer', label: 'Ayer' },
    { value: 'esta-semana', label: 'Esta semana' },
    { value: 'semana-pasada', label: 'Semana pasada' },
    { value: 'este-mes', label: 'Este mes' },
    { value: 'mes-pasado', label: 'Mes pasado' },
    { value: 'personalizado', label: 'Fecha personalizada' }
  ];

  // Para fecha personalizada
  fechaPersonalizada: string = '';
  mostrarFechaPersonalizada = false;

  private ventasChart: Chart | null = null;
  private categoriasChart: Chart | null = null;
  private actualizacionInterval: any;

  constructor(private dashboardService: DashboardService) {
    // Inicializar con fecha de hoy
    this.fechaSeleccionada = 'hoy';
    this.fechaPersonalizada = this.formatearFecha(new Date());
  }

  ngOnInit(): void {
    this.cargarDatos();
    
    // Actualizar cada 5 minutos solo si es "hoy"
    this.actualizacionInterval = setInterval(() => {
      if (this.fechaSeleccionada === 'hoy') {
        this.cargarDatos();
      }
    }, 5 * 60 * 1000);
  }

  ngAfterViewInit(): void {
    // Los gráficos se inicializarán cuando lleguen los datos
  }

  ngOnDestroy(): void {
    if (this.actualizacionInterval) {
      clearInterval(this.actualizacionInterval);
    }
    this.destruirGraficos();
  }

  onFechaChange(): void {
    this.mostrarFechaPersonalizada = this.fechaSeleccionada === 'personalizado';
    
    if (this.fechaSeleccionada !== 'personalizado') {
      this.cargarDatos();
    }
  }

  onFechaPersonalizadaChange(): void {
    if (this.fechaPersonalizada && this.fechaSeleccionada === 'personalizado') {
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    const fecha = this.obtenerFechaFiltro();

    this.dashboardService.obtenerDatosDashboard(fecha).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.cargando = false;
        this.validarDatos();
        
        setTimeout(() => {
          this.initCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.error = 'Error al conectar con el servidor. Verifique que el backend esté ejecutándose.';
        this.cargando = false;
        this.crearEstructuraVacia();
      }
    });
  }

  private obtenerFechaFiltro(): string {
    const hoy = new Date();
    
    switch (this.fechaSeleccionada) {
      case 'hoy':
        return this.formatearFecha(hoy);
        
      case 'ayer':
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        return this.formatearFecha(ayer);
        
      case 'esta-semana':
        // Lunes de esta semana
        const inicioSemana = new Date(hoy);
        const dia = hoy.getDay();
        const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);
        inicioSemana.setDate(diff);
        return this.formatearFecha(inicioSemana);
        
      case 'semana-pasada':
        // Lunes de la semana pasada
        const inicioSemanaPasada = new Date(hoy);
        const diaPasado = hoy.getDay();
        const diffPasado = hoy.getDate() - diaPasado + (diaPasado === 0 ? -6 : 1) - 7;
        inicioSemanaPasada.setDate(diffPasado);
        return this.formatearFecha(inicioSemanaPasada);
        
      case 'este-mes':
        // Primer día del mes actual
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        return this.formatearFecha(inicioMes);
        
      case 'mes-pasado':
        // Primer día del mes pasado
        const inicioMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        return this.formatearFecha(inicioMesPasado);
        
      case 'personalizado':
        return this.fechaPersonalizada;
        
      default:
        return this.formatearFecha(hoy);
    }
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  private validarDatos(): void {
    if (!this.dashboardData) return;

    this.dashboardData.stockCritico = this.dashboardData.stockCritico || [];
    this.dashboardData.ventasSemanales = this.dashboardData.ventasSemanales || [];
    this.dashboardData.ventasPorCategoria = this.dashboardData.ventasPorCategoria || [];

    if (!this.dashboardData.ventasDelDia) {
      this.dashboardData.ventasDelDia = { totalVentas: 0, cantidadPedidos: 0, promedioTicket: 0 };
    }

    if (!this.dashboardData.cajaActual) {
      this.dashboardData.cajaActual = { 
        efectivo: 0, tarjeta: 0, delivery: 0, yape: 0, plin: 0, transferencia: 0, total: 0 
      };
    }

    if (!this.dashboardData.pedidosActivos) {
      this.dashboardData.pedidosActivos = { enCocina: 0, pendientes: 0, completados: 0, total: 0 };
    }

    if (!this.dashboardData.productoMasVendido) {
      this.dashboardData.productoMasVendido = { 
        productoId: 0, nombreProducto: 'Sin datos', cantidadVendida: 0, totalIngresos: 0 
      };
    }

    if (!this.dashboardData.deliveryInfo) {
      this.dashboardData.deliveryInfo = { enCamino: 0, sinAsignar: 0, completados: 0, total: 0 };
    }
  }

  private crearEstructuraVacia(): void {
    this.dashboardData = {
      ventasDelDia: { totalVentas: 0, cantidadPedidos: 0, promedioTicket: 0 },
      cajaActual: { efectivo: 0, tarjeta: 0, delivery: 0, yape: 0, plin: 0, transferencia: 0, total: 0 },
      pedidosActivos: { enCocina: 0, pendientes: 0, completados: 0, total: 0 },
      stockCritico: [],
      productoMasVendido: { productoId: 0, nombreProducto: 'Sin datos', cantidadVendida: 0, totalIngresos: 0 },
      deliveryInfo: { enCamino: 0, sinAsignar: 0, completados: 0, total: 0 },
      ventasSemanales: [],
      ventasPorCategoria: []
    };
  }

  private initCharts(): void {
    if (!this.dashboardData) return;

    this.destruirGraficos();

    if (this.dashboardData.ventasSemanales.length > 0) {
      this.initVentasChart();
    }
    
    if (this.dashboardData.ventasPorCategoria.length > 0) {
      this.initCategoriasChart();
    }
  }

  private initVentasChart(): void {
    const lineCanvas = document.getElementById('ventasLineChart') as HTMLCanvasElement;
    if (lineCanvas && this.dashboardData && this.dashboardData.ventasSemanales.length > 0) {
      const labels = this.dashboardData.ventasSemanales.map(v => this.obtenerNombreDia(v.fecha));
      const data = this.dashboardData.ventasSemanales.map(v => v.total);

      this.ventasChart = new Chart(lineCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ventas (S/.)',
            data: data,
            fill: true,
            borderColor: '#7B1C1C',
            backgroundColor: 'rgba(123, 28, 28, 0.2)',
            tension: 0.4,
            pointBackgroundColor: '#7B1C1C',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              callbacks: {
                label: (context) => {
                  const venta = this.dashboardData!.ventasSemanales[context.dataIndex];
                  return [
                    `Ventas: S/. ${context.parsed.y.toLocaleString()}`,
                    `Pedidos: ${venta.cantidadPedidos}`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (value) => `S/. ${value}` }
            }
          }
        }
      });
    }
  }

  private initCategoriasChart(): void {
    const doughnutCanvas = document.getElementById('ventasChart') as HTMLCanvasElement;
    if (doughnutCanvas && this.dashboardData && this.dashboardData.ventasPorCategoria.length > 0) {
      const labels = this.dashboardData.ventasPorCategoria.map(v => v.categoria);
      const data = this.dashboardData.ventasPorCategoria.map(v => v.total);
      const colors = ['#E53935', '#FDD835', '#43A047', '#1E88E5', '#9C27B0', '#FF9800'];
      const total = data.reduce((sum, valor) => sum + valor, 0);

      this.categoriasChart = new Chart(doughnutCanvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors.slice(0, data.length),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                font: { size: 12 },
                generateLabels: (chart) => {
                  const dataset = chart.data.datasets[0];
                  return chart.data.labels!.map((label, index) => {
                    const valor = dataset.data[index] as number;
                    const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;
                    return {
                      text: `${label} (${porcentaje}%)`,
                      fillStyle: colors[index],
                      strokeStyle: colors[index],
                      lineWidth: 0,
                      pointStyle: 'circle'
                    };
                  });
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              callbacks: {
                label: (context) => {
                  const valor = context.parsed as number;
                  const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;
                  return [
                    `${context.label}: S/. ${valor.toLocaleString()}`,
                    `Porcentaje: ${porcentaje}%`
                  ];
                }
              }
            }
          }
        }
      });
    }
  }

  private destruirGraficos(): void {
    if (this.ventasChart) {
      this.ventasChart.destroy();
      this.ventasChart = null;
    }
    if (this.categoriasChart) {
      this.categoriasChart.destroy();
      this.categoriasChart = null;
    }
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor || 0);
  }

  actualizarDatos(): void {
    this.cargarDatos();
  }

  get stockCriticoLimitado() {
    return this.dashboardData?.stockCritico.slice(0, 3) || [];
  }

  getTotalVentasSemanales(): number {
    if (!this.dashboardData?.ventasSemanales) return 0;
    return this.dashboardData.ventasSemanales.reduce((sum, venta) => sum + venta.total, 0);
  }

  getCantidadCategorias(): number {
    return this.dashboardData?.ventasPorCategoria.length || 0;
  }

  private obtenerNombreDia(fecha: string): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const fechaObj = new Date(fecha);
    return dias[fechaObj.getDay()];
  }

  // Método para obtener el título dinámico según el filtro
  getTituloFecha(): string {
    switch (this.fechaSeleccionada) {
      case 'hoy': return 'Datos de hoy';
      case 'ayer': return 'Datos de ayer';
      case 'esta-semana': return 'Datos de esta semana';
      case 'semana-pasada': return 'Datos de la semana pasada';
      case 'este-mes': return 'Datos de este mes';
      case 'mes-pasado': return 'Datos del mes pasado';
      case 'personalizado': return `Datos del ${this.fechaPersonalizada}`;
      default: return 'Dashboard Administrativo';
    }
  }
}
