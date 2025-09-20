import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComandaRoutingModule } from './comanda-routing.module';

import { ComandaComponent } from './comanda.component';
import { ComandaMozosComponent } from './comanda-mozos/comanda-mozos.component';
import { ComandaCocinaComponent } from './comanda-cocina/comanda-cocina.component';
import { ComandaAdminComponent } from './comanda-admin/comanda-admin.component';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { ComandaPedidoComponent } from './comanda-pedido/comanda-pedido.component';
import { CobrarPedidoComponent } from './cobrar-pedido/cobrar-pedido.component';
import { ClientePopupComponent } from './cliente-popup/cliente-popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ComandaCocinerosComponent } from './comanda-cocineros/comanda-cocineros.component';

import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    ComandaComponent,
    ComandaMozosComponent,
    ComandaCocinaComponent,
    ComandaAdminComponent,
    ComandaPedidoComponent,
    CobrarPedidoComponent,
    ClientePopupComponent,
    ComandaCocinerosComponent
  ],
  imports: [
    CommonModule,
    ComandaRoutingModule,
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
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatCheckboxModule
  ],
  exports: [
    ComandaComponent,
    ComandaMozosComponent,
    ComandaCocinaComponent,
    ComandaAdminComponent
  ]
})
export class ComandaModule { }