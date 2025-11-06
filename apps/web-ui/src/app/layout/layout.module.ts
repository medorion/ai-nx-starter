import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// ng-zorro modules
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
// Shared modules
import { IconsModule } from '../shared/icons/icons.module';
import { SharedModule } from '../shared/shared.module';

// Layout Components
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

import { UiAppContextService } from '../core/services/ui-app-context.service';

@NgModule({
  declarations: [HeaderComponent, FooterComponent],
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzBreadCrumbModule,
    NzDropDownModule,
    NzAvatarModule,
    IconsModule,
    SharedModule,
  ],
  providers: [UiAppContextService],
  exports: [HeaderComponent, FooterComponent, IconsModule, NzLayoutModule],
})
export class LayoutModule {}
