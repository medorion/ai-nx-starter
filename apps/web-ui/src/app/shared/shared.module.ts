import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Shared modules
import { IconsModule } from './icons/icons.module';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { RedirectingToLoginComponent } from './pages/redirecting-to-login/redirecting-to-login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { LoadingComponent } from './pages/loading/loading.component';
import { LoginComponent } from './pages/login/login.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { FormDebugComponent } from './components/form-debug/form-debug.component';
import { FormDebugLinkComponent } from './components/form-debug-link/form-debug-link.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzStepsModule } from 'ng-zorro-antd/steps';

@NgModule({
  declarations: [
    RedirectingToLoginComponent,
    PageNotFoundComponent,
    LoadingComponent,
    LoginComponent,
    WelcomeComponent,
    ThemeToggleComponent,
    FormDebugComponent,
    FormDebugLinkComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconsModule,
    NzSpinModule,
    NzButtonModule,
    NzSwitchModule,
    NzModalModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzCollapseModule,
    NzBadgeModule,
    NzDividerModule,
    NzAlertModule,
    NzTableModule,
    NzSpaceModule,
    NzGridModule,
    NzFormModule,
    NzInputModule,
    NzListModule,
    NzStepsModule,
  ],
  exports: [
    IconsModule,
    ThemeToggleComponent,
    RedirectingToLoginComponent,
    PageNotFoundComponent,
    LoadingComponent,
    LoginComponent,
    WelcomeComponent,
    FormDebugComponent,
    FormDebugLinkComponent,
  ],
})
export class SharedModule {}
