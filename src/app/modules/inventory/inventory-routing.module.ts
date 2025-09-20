import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { MesasComponent } from './mesas/mesas.component';
import { AdminInsumosComponent } from './admin-insumos/admin-insumos.component';
import { StockInsumosComponent } from './stock-insumos/stock-insumos.component';
import { ReporteMovimientosComponent } from './reporte-movimientos/reporte-movimientos.component';
import { CajaDashboardComponent } from './caja-dashboard/caja-dashboard.component';
import { OrdenCompraDashboardComponent } from './orden-compra-dashboard/orden-compra-dashboard.component';
import { MovimientosReporteComponent } from './movimientos-reporte/movimientos-reporte.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'categorias', component: CategoriasComponent },
  { path: 'mesas', component: MesasComponent },
  { path: 'insumos', component: AdminInsumosComponent },
  { path: 'stock', component: StockInsumosComponent },
  { path: 'reporte', component: ReporteMovimientosComponent },
  { path: 'caja', component: CajaDashboardComponent },
  { path: 'ordenCompra', component: OrdenCompraDashboardComponent },
  { path: 'movimientos', component: MovimientosReporteComponent },
  { path: 'dasboard', component: DashboardComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
