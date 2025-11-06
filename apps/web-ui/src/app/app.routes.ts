import { Routes } from '@angular/router';
import { RedirectingToLoginComponent } from './shared/pages/redirecting-to-login/redirecting-to-login.component';
import { PageNotFoundComponent } from './shared/pages/page-not-found/page-not-found.component';
import { LoadingComponent } from './shared/pages/loading/loading.component';
import { LoginComponent } from './shared/pages/login/login.component';
import { WelcomeComponent } from './shared/pages/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    data: { breadcrumb: 'Home' },
  },
  {
    path: 'loading',
    component: LoadingComponent,
    data: { breadcrumb: 'Loading...' },
  },
  {
    path: 'examples',
    loadChildren: () => import('./features/examples/examples.module').then((m) => m.ExamplesModule),
    data: { breadcrumb: 'Examples' },
  },
  {
    path: 'backoffice',
    loadChildren: () => import('./features/backoffice/backoffice.module').then((m) => m.BackofficeModule),
    data: { breadcrumb: 'Backoffice' },
  },
  {
    path: 'redirecting-to-login',
    component: RedirectingToLoginComponent,
    data: { breadcrumb: 'Redirecting to login' },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { breadcrumb: 'Login' },
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    data: { breadcrumb: 'Page not found' },
  },
];
