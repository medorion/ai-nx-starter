import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListItemsComponent } from './components/list-items/list-items.component';
import { ListItemFormComponent } from './components/list-item-form/list-item-form.component';

const routes: Routes = [
  {
    path: '',
    component: ListItemsComponent,
    data: { breadcrumb: 'Members' },
  },
  {
    path: 'new',
    component: ListItemFormComponent,
    data: { breadcrumb: 'Add Member' },
  },
  {
    path: ':id/edit',
    component: ListItemFormComponent,
    data: { breadcrumb: 'Edit Member' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListItemsRoutingModule {}
