import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ng-zorro-antd modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzMentionModule } from 'ng-zorro-antd/mention';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';

// Components
import { ButtonsComponent } from './buttons/buttons.component';
import { ShellComponent } from './shell/shell.component';
import { FormsComponent } from './forms/forms.component';
import { DecoratorComponent } from './decorators/decorator.component';
import { PubSubExampleComponent } from './pub-sub/pub-sub-example.component';
import { ExceptionsExampleComponent } from './exceptions/exceptions-example.component';

// Shared modules
import { SharedModule } from '../../shared/shared.module';

// Routing
import { ExamplesRoutingModule } from './examples-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Array of all ng-zorro modules for easy management
const NG_ZORRO_MODULES = [
  // Basic Components
  NzButtonModule,
  NzIconModule,
  NzTypographyModule,
  NzGridModule,
  NzLayoutModule,
  NzSpaceModule,
  NzDividerModule,
  NzAffixModule,
  NzBreadCrumbModule,
  NzDropDownModule,
  NzMenuModule,
  NzPageHeaderModule,
  NzPaginationModule,
  NzStepsModule,

  // Form Components
  NzFormModule,
  NzInputModule,
  NzInputNumberModule,
  NzSelectModule,
  NzCheckboxModule,
  NzRadioModule,
  NzSwitchModule,
  NzSliderModule,
  NzRateModule,
  NzDatePickerModule,
  NzTimePickerModule,
  NzUploadModule,
  NzAutocompleteModule,
  NzCascaderModule,
  NzMentionModule,
  NzTreeSelectModule,
  NzTransferModule,

  // Data Display
  NzTableModule,
  NzTagModule,
  NzAvatarModule,
  NzBadgeModule,
  NzCardModule,
  NzCarouselModule,
  NzCollapseModule,
  NzCommentModule,
  NzDescriptionsModule,
  NzEmptyModule,
  NzListModule,
  NzPopoverModule,
  NzStatisticModule,
  NzTreeModule,
  NzToolTipModule,
  NzCalendarModule,

  // Feedback
  NzAlertModule,
  NzDrawerModule,
  NzModalModule,
  NzPopconfirmModule,
  NzProgressModule,
  NzResultModule,
  NzSkeletonModule,
  NzSpinModule,

  // Navigation
  NzAnchorModule,
  NzBackTopModule,
  NzTabsModule,
];

@NgModule({
  declarations: [ButtonsComponent, ShellComponent, FormsComponent, DecoratorComponent, PubSubExampleComponent, ExceptionsExampleComponent],
  imports: [CommonModule, ...NG_ZORRO_MODULES, ExamplesRoutingModule, ReactiveFormsModule, FormsModule, SharedModule],
  exports: [
    ...NG_ZORRO_MODULES,
    ReactiveFormsModule,
    FormsModule,
    ButtonsComponent,
    ShellComponent,
    FormsComponent,
    PubSubExampleComponent,
    ExceptionsExampleComponent,
  ],
  providers: [NzMessageService, NzNotificationService],
})
export class ExamplesModule {}
