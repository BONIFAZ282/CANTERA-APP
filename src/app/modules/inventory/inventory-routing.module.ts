import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { MesasComponent } from './mesas/mesas.component';

const routes: Routes = [
  { path: 'categorias', component: CategoriasComponent },
  { path: 'mesas', component: MesasComponent }
  
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
