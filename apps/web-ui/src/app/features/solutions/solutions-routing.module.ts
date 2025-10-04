import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  {
    path: ':solutionId',
    component: SolutionComponent,
    children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'objectives', component: ObjectivesComponent },
      { path: 'event-scheduler', component: EventSchedulerComponent },
      { path: 'event-tracking', component: EventTrackingComponent },
      { path: 'events-definition', component: EventsDefinitionComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'sms-templates', component: SmsTemplatesComponent },
      { path: 'ivr-templates', component: IvrTemplatesComponent },
      { path: 'email-templates', component: EmailTemplatesComponent },
      { path: 'facebook-templates', component: FacebookTemplatesComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: SolutionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolutionsRoutingModule {}
