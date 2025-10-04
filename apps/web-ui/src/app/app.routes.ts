import { Routes } from '@angular/router';
import { environment } from '../environments/environment';

export const routes: Routes = [
  {
    path: 'solutions',
    loadChildren: () => import('./features/solutions/solutions.module').then((m) => m.SolutionsModule),
    data: { breadcrumb: 'Solutions' },
  },
  {
    path: 'backoffice',
    loadChildren: () => import('./features/backoffice/backoffice.module').then((m) => m.BackofficeModule),
    data: { breadcrumb: 'Backoffice' },
  },
  {
    path: 'operations',
    loadChildren: () => import('./features/operation/operation.module').then((m) => m.OperationModule),
    data: { breadcrumb: 'Operations' },
  },
  {
    path: '',
    redirectTo: '/backoffice',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/backoffice',
  },
];

// Add examples route only in development
if (!environment.production) {
  routes.unshift({
    path: 'examples',
    loadChildren: () => import('./features/examples/examples.module').then((m) => m.ExamplesModule),
    data: { breadcrumb: 'Examples' },
  });
}
