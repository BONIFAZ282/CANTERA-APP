import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdenesCompraRoutingModule } from './ordenes-compra-routing.module';
import { OrdenesCompraComponent } from './ordenes-compra.component';

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
import { MatSelectModule } from '@angular/material/select';
import { OrdenesCompraListarComponent } from './ordenes-compra-listar/ordenes-compra-listar.component';
import { OrdenesCompraAgregarComponent } from './ordernes-compra-agregar/ordenes-compra-agregar.component';

@NgModule({
  declarations: [
    OrdenesCompraComponent,
    OrdenesCompraListarComponent,
    OrdenesCompraAgregarComponent
  ],
  imports: [
    CommonModule,
    OrdenesCompraRoutingModule,
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
    MatSelectModule
  ]
})
export class OrdenesCompraModule { }
