import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Shared modules
import { IconsModule } from './icons/icons.module';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

@NgModule({
  imports: [CommonModule, IconsModule, ThemeToggleComponent],
  exports: [IconsModule, ThemeToggleComponent],
})
export class SharedModule {}
