import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryComponent } from './inventory.component';
import { CategoriasComponent } from './categorias/categorias.component';




import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltip } from '@angular/material/tooltip';
import { MatTab } from '@angular/material/tabs';
import { MatTabGroup } from '@angular/material/tabs';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

import { MatTooltipModule } from '@angular/material/tooltip';


import { MatSelectModule } from '@angular/material/select';
import { MesasComponent } from './mesas/mesas.component';
import { AdminInsumosComponent } from './admin-insumos/admin-insumos.component';
import { ProductosComponent } from './productos/productos.component';
import { StockInsumosComponent } from './stock-insumos/stock-insumos.component';
import { ReporteMovimientosComponent } from './reporte-movimientos/reporte-movimientos.component';
import { CajaDashboardComponent } from './caja-dashboard/caja-dashboard.component';
import { OrdenCompraDashboardComponent } from './orden-compra-dashboard/orden-compra-dashboard.component';

@NgModule({
  declarations: [
    InventoryComponent,
    CategoriasComponent,
    MesasComponent,
    AdminInsumosComponent,
    ProductosComponent,
    StockInsumosComponent,
    ReporteMovimientosComponent,
    CajaDashboardComponent,
    OrdenCompraDashboardComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatCardModule,
    MatTooltip,
    MatTab,
    MatTabGroup,
    MatOption,
    FormsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class InventoryModule { }
