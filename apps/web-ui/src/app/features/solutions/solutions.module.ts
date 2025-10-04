import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { SolutionsRoutingModule } from './solutions-routing.module';
import { SolutionComponent } from './solution.component';
import { OverviewComponent } from './overview/overview.component';
import { ObjectivesComponent } from './objectives/objectives.component';
import { EventSchedulerComponent } from './event-scheduler/event-scheduler.component';
import { EventTrackingComponent } from './event-tracking/event-tracking.component';
import { EventsDefinitionComponent } from './events-definition/events-definition.component';
import { MessagesComponent } from './messages/messages.component';
import { SmsTemplatesComponent } from './sms-templates/sms-templates.component';
import { IvrTemplatesComponent } from './ivr-templates/ivr-templates.component';
import { EmailTemplatesComponent } from './email-templates/email-templates.component';
import { FacebookTemplatesComponent } from './facebook-templates/facebook-templates.component';

@NgModule({
  declarations: [
    SolutionComponent,
    OverviewComponent,
    ObjectivesComponent,
    EventSchedulerComponent,
    EventTrackingComponent,
    EventsDefinitionComponent,
    MessagesComponent,
    SmsTemplatesComponent,
    IvrTemplatesComponent,
    EmailTemplatesComponent,
    FacebookTemplatesComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SolutionsRoutingModule,
    NzLayoutModule,
    NzIconModule,
    NzButtonModule,
    NzMenuModule,
    NzToolTipModule,
    NzCalendarModule,
    NzSelectModule,
    NzCardModule,
    NzBadgeModule,
    NzEmptyModule,
    NzDrawerModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzStatisticModule,
    NzListModule,
    NzTagModule,
    NzDividerModule,
  ],
})
export class SolutionsModule {}
