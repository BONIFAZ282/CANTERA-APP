import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdenesCompraListarComponent } from './ordenes-compra-listar/ordenes-compra-listar.component';
import { OrdenesCompraAgregarComponent } from './ordernes-compra-agregar/ordenes-compra-agregar.component';

const routes: Routes = [
  { path: '', component: OrdenesCompraListarComponent },
  { path: 'agregar', component: OrdenesCompraAgregarComponent },
  { path: 'editar/:id', component: OrdenesCompraAgregarComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdenesCompraRoutingModule { }
