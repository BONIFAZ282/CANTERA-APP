import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importa el routing module
import { ComandaRoutingModule } from './comanda-routing.module';

// Importa los componentes
import { ComandaComponent } from './comanda.component';
import { ComandaMozosComponent } from './comanda-mozos/comanda-mozos.component';
import { ComandaCocinaComponent } from './comanda-cocina/comanda-cocina.component';
import { ComandaAdminComponent } from './comanda-admin/comanda-admin.component';

// Importa los módulos de Material que necesitas
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { ComandaPedidoComponent } from './comanda-pedido/comanda-pedido.component';

@NgModule({
  declarations: [
    ComandaComponent,
    ComandaMozosComponent,
    ComandaCocinaComponent,
    ComandaAdminComponent,
    ComandaPedidoComponent
  ],
  imports: [
    CommonModule,
    ComandaRoutingModule,
    // Módulos de Material necesarios
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonToggleModule,
    FormsModule,
    MatBadgeModule
  ],
  exports: [
    // Exporta los componentes si necesitas usarlos fuera de este módulo
    ComandaComponent,
    ComandaMozosComponent,
    ComandaCocinaComponent,
    ComandaAdminComponent
  ]
})
export class ComandaModule { }