import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CargosComponent } from './cargos/cargos.component';
import { TurnosComponent } from './turnos/turnos.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { PrivilegiosComponent } from './privilegios/privilegios.component';
import { UsuariosComponent } from './usuarios/usuarios.component';

const routes: Routes = [
  { path: 'cargos', component: CargosComponent },
  { path: 'turnos', component: TurnosComponent },
  { path: 'empleados', component: EmpleadosComponent },
  { path: 'privilegios', component: PrivilegiosComponent },
  { path: 'usuarios', component: UsuariosComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RrhhRoutingModule { }
