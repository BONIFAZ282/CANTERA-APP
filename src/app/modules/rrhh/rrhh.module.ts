import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RrhhRoutingModule } from './rrhh-routing.module';
import { RrhhComponent } from './rrhh.component';
import { CargosComponent } from './cargos/cargos.component';
import { TurnosComponent } from './turnos/turnos.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { PrivilegiosComponent } from './privilegios/privilegios.component';
import { UsuariosComponent } from './usuarios/usuarios.component';


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


@NgModule({
  declarations: [
    RrhhComponent,
    CargosComponent,
    TurnosComponent,
    EmpleadosComponent,
    PrivilegiosComponent,
    UsuariosComponent
  ],
  imports: [
    CommonModule,
    RrhhRoutingModule,
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
export class RrhhModule { }
