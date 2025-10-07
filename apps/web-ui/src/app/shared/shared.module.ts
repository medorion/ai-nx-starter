import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Shared modules
import { IconsModule } from './icons/icons.module';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { RedirectingToLoginComponent } from './pages/redirecting-to-login/redirecting-to-login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { LoadingComponent } from './pages/loading/loading.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
  declarations: [RedirectingToLoginComponent, PageNotFoundComponent, LoadingComponent],
  imports: [CommonModule, IconsModule, ThemeToggleComponent, NzSpinModule, NzButtonModule],
  exports: [IconsModule, ThemeToggleComponent, RedirectingToLoginComponent, PageNotFoundComponent, LoadingComponent],
})
export class SharedModule {}
