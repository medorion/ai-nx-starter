import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ThemeService } from '../../../core/services/theme.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  template: ` <nz-switch [ngModel]="isDark$ | async" (ngModelChange)="onToggle()" [nzSize]="size"> </nz-switch> `,
  standalone: true,
  imports: [CommonModule, FormsModule, NzSwitchModule],
})
export class ThemeToggleComponent {
  @Input() size: 'default' | 'small' = 'default';

  isDark$: Observable<boolean>;

  constructor(private themeService: ThemeService) {
    this.isDark$ = this.themeService.theme$.pipe(map((theme) => theme === 'dark'));
  }

  onToggle(): void {
    this.themeService.toggleTheme();
  }
}
