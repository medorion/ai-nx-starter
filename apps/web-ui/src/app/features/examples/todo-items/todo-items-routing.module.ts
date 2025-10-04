import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoItemsListComponent } from './components/todo-items-list/todo-items-list.component';
import { TodoItemFormComponent } from './components/todo-item-form/todo-item-form.component';

const routes: Routes = [
  {
    path: '',
    component: TodoItemsListComponent,
    data: { breadcrumb: 'Todo Items' },
  },
  {
    path: 'new',
    component: TodoItemFormComponent,
    data: { breadcrumb: 'Add Todo Item' },
  },
  {
    path: ':id/edit',
    component: TodoItemFormComponent,
    data: { breadcrumb: 'Edit Todo Item' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TodoItemsRoutingModule {}
