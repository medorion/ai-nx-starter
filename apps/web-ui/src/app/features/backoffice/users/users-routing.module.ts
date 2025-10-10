import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';

const routes: Routes = [
  {
    path: '',
    component: UsersListComponent,
    data: { breadcrumb: 'Users' },
  },
  {
    path: 'new',
    component: UserFormComponent,
    data: { breadcrumb: 'Add User' },
  },
  {
    path: ':id/edit',
    component: UserFormComponent,
    data: { breadcrumb: 'Edit User' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
