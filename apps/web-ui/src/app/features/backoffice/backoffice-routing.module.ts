import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
    data: { breadcrumb: 'Users' },
  },
  {
    path: 'teams',
    loadChildren: () => import('./teams/teams.module').then((m) => m.TeamsModule),
    data: { breadcrumb: 'Teams' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackofficeRoutingModule {}
