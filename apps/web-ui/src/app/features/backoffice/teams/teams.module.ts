import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Required ng-zorro modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';

// Components
import { TeamsListComponent } from './components/teams-list/teams-list.component';
import { TeamFormComponent } from './components/team-form/team-form.component';

// Shared modules
import { SharedModule } from '../../../shared/shared.module';

// Routing
import { TeamsRoutingModule } from './teams-routing.module';

@NgModule({
  declarations: [TeamsListComponent, TeamFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TeamsRoutingModule,
    SharedModule,

    // ng-zorro modules
    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzFormModule,
    NzPaginationModule,
    NzTagModule,
    NzAvatarModule,
    NzEmptyModule,
    NzIconModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzCardModule,
    NzSelectModule,
    NzDividerModule,
    NzModalModule,
  ],
})
export class TeamsModule {}
