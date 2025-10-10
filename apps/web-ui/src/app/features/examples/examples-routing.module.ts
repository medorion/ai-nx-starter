import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { FormsComponent } from './forms/forms.component';
import { DecoratorComponent } from './decorators/decorator.component';
import { PubSubExampleComponent } from './pub-sub/pub-sub-example.component';
import { ExceptionsExampleComponent } from './exceptions/exceptions-example.component';
import { ServerEventsDemoComponent } from './server-events-demo/server-events-demo.component';

const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    data: { breadcrumb: 'Welcome' },
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
    data: { breadcrumb: 'Welcome' },
  },
  {
    path: 'buttons',
    component: ButtonsComponent,
    data: { breadcrumb: 'Buttons' },
  },
  {
    path: 'forms',
    component: FormsComponent,
    data: { breadcrumb: 'Forms' },
  },
  {
    path: 'decorators',
    component: DecoratorComponent,
    data: { breadcrumb: 'Decorators' },
  },
  {
    path: 'pub-sub',
    component: PubSubExampleComponent,
    data: { breadcrumb: 'Pub-Sub System' },
  },
  {
    path: 'exceptions',
    component: ExceptionsExampleComponent,
    data: { breadcrumb: 'Exception Testing' },
  },
  {
    path: 'server-events',
    component: ServerEventsDemoComponent,
    data: { breadcrumb: 'Server Events' },
  },
  {
    path: 'list-items',
    loadChildren: () => import('./list-item/list-items.module').then((m) => m.ListItemsModule),
    data: { breadcrumb: 'List Item' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamplesRoutingModule {}
