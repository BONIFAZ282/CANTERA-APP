import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComandaComponent } from './comanda.component';
import { ComandaMozosComponent } from './comanda-mozos/comanda-mozos.component';
import { ComandaCocinaComponent } from './comanda-cocina/comanda-cocina.component';
import { ComandaAdminComponent } from './comanda-admin/comanda-admin.component';
import { ComandaPedidoComponent } from './comanda-pedido/comanda-pedido.component';
import { CobrarPedidoComponent } from './cobrar-pedido/cobrar-pedido.component';
import { ComandaCocinerosComponent } from './comanda-cocineros/comanda-cocineros.component';



const routes: Routes = [
  {
    path: '',
    component: ComandaComponent,
    children: [
      { path: 'mozos', component: ComandaMozosComponent },
      { path: 'cocina', component: ComandaCocinerosComponent },
      { path: 'admin', component: ComandaAdminComponent },
      { path: 'pedido/:mesa', component: ComandaPedidoComponent },
      {
        path: 'pedido/:mesa/editar/:pedidoId',
        component: ComandaPedidoComponent
      },
      {
        path: 'cobrar/:pedidoId',
        component: CobrarPedidoComponent
      },
      { path: '', redirectTo: 'mozos', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComandaRoutingModule { }
