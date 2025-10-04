import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Required ng-zorro modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

// Components
import { TodoItemsListComponent } from './components/todo-items-list/todo-items-list.component';
import { TodoItemFormComponent } from './components/todo-item-form/todo-item-form.component';

// Routing
import { TodoItemsRoutingModule } from './todo-items-routing.module';

@NgModule({
  declarations: [TodoItemsListComponent, TodoItemFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TodoItemsRoutingModule,

    // ng-zorro modules
    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzFormModule,
    NzModalModule,
    NzPaginationModule,
    NzTagModule,
    NzEmptyModule,
    NzIconModule,
    NzToolTipModule,
    NzInputNumberModule,
    NzAlertModule,
    NzCardModule,
    NzSelectModule,
    NzDatePickerModule,
    NzDividerModule,
    NzCheckboxModule,
    NzCollapseModule,
    NzStepsModule,
    NzBadgeModule,
  ],
})
export class TodoItemsModule {}
