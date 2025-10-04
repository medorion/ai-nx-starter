import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { FormsComponent } from './forms/forms.component';
import { DecoratorComponent } from './decorators/decorator.component';
import { PubSubExampleComponent } from './pub-sub/pub-sub-example.component';
import { ExceptionsExampleComponent } from './exceptions/exceptions-example.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    data: { breadcrumb: 'Shell' },
  },
  {
    path: 'shell',
    component: ShellComponent,
    data: { breadcrumb: 'Shell' },
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
    path: 'list-items',
    loadChildren: () => import('./list-item/list-items.module').then((m) => m.ListItemsModule),
    data: { breadcrumb: 'List Items' },
  },
  {
    path: 'todo-items',
    loadChildren: () => import('./todo-items/todo-items.module').then((m) => m.TodoItemsModule),
    data: { breadcrumb: 'Todo Items' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamplesRoutingModule {}
