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
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAlertModule } from 'ng-zorro-antd/alert';

// Components
import { ListItemsComponent } from './components/list-items/list-items.component';
import { ListItemFormComponent } from './components/list-item-form/list-item-form.component';
import { FormDebugComponent } from '../../../shared/components/form-debug/form-debug.component';
import { FormDebugLinkComponent } from '../../../shared/components/form-debug-link/form-debug-link.component';

// Routing
import { ListItemsRoutingModule } from './list-items-routing.module';

@NgModule({
  declarations: [ListItemsComponent, ListItemFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ListItemsRoutingModule,

    // ng-zorro modules
    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzFormModule,
    NzModalModule,
    NzPaginationModule,
    NzTagModule,
    NzAvatarModule,
    NzEmptyModule,
    NzIconModule,
    NzToolTipModule,
    NzInputNumberModule,
    NzAlertModule,

    // Standalone components
    FormDebugComponent,
    FormDebugLinkComponent,
  ],
})
export class ListItemsModule {}
