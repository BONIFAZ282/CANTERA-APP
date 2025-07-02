import { NgModule } from '@angular/core';
import { RouterModule,Routes } from '@angular/router';
import { ComandaComponent } from './comanda.component';
import { ComandaMozosComponent } from './comanda-mozos/comanda-mozos.component';
import { ComandaCocinaComponent } from './comanda-cocina/comanda-cocina.component';
import { ComandaAdminComponent } from './comanda-admin/comanda-admin.component';

const routes: Routes = [
  {
    path: '',
    component: ComandaComponent,
    children: [
      { path: 'mozos', component: ComandaMozosComponent },
      { path: 'cocina', component: ComandaCocinaComponent },
      { path: 'admin', component: ComandaAdminComponent },
      { path: '', redirectTo: 'mozos', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComandaRoutingModule {}
