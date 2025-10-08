import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackofficeRoutingModule } from './backoffice-routing.module';

// ng-zorro imports
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { SolutionsComponent } from './solutions/solutions.component';
import { SolutionFormComponent } from './solutions/solution-form/solution-form.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationFormComponent } from './organizations/organization-form/organization-form.component';
import { UsersComponent } from './users/users.component';
import { ServerFlowsComponent } from './server-flows/server-flows.component';
import { SettingsComponent } from './settings/settings.component';

// Import shared modules
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    SolutionsComponent,
    SolutionFormComponent,
    OrganizationsComponent,
    OrganizationFormComponent,
    UsersComponent,
    ServerFlowsComponent,
    SettingsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackofficeRoutingModule,
    SharedModule,
    NzInputModule,
    NzButtonModule,
    NzTableModule,
    NzIconModule,
    NzAvatarModule,
    NzTagModule,
    NzBadgeModule,
    NzEmptyModule,
    NzPaginationModule,
    NzModalModule,
    NzMessageModule,
    NzToolTipModule,
    NzSelectModule,
    NzFormModule,
    NzInputNumberModule,
    NzCardModule,
    NzSwitchModule,
    NzPopconfirmModule,
    NzCollapseModule,
    NzDrawerModule,
    NzAlertModule,
  ],
})
export class BackofficeModule {}
