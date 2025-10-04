import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SolutionsComponent } from './solutions/solutions.component';
import { SolutionFormComponent } from './solutions/solution-form/solution-form.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationFormComponent } from './organizations/organization-form/organization-form.component';
import { UsersComponent } from './users/users.component';
import { ServerFlowsComponent } from './server-flows/server-flows.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: 'solutions',
    component: SolutionsComponent,
    data: { breadcrumb: 'Solutions' },
  },
  {
    path: 'solutions/new',
    component: SolutionFormComponent,
    data: { breadcrumb: 'New Solution' },
  },
  {
    path: 'solutions/:id/edit',
    component: SolutionFormComponent,
    data: { breadcrumb: 'Edit Solution' },
  },
  {
    path: 'organizations',
    component: OrganizationsComponent,
    data: { breadcrumb: 'Organizations' },
  },
  {
    path: 'organizations/new',
    component: OrganizationFormComponent,
    data: { breadcrumb: 'New Organization' },
  },
  {
    path: 'organizations/:id/edit',
    component: OrganizationFormComponent,
    data: { breadcrumb: 'Edit Organization' },
  },
  {
    path: 'users',
    component: UsersComponent,
    data: { breadcrumb: 'Users' },
  },
  {
    path: 'server-flows',
    component: ServerFlowsComponent,
    data: { breadcrumb: 'Server Flows (Technical)' },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    data: { breadcrumb: 'Settings' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackofficeRoutingModule {}
