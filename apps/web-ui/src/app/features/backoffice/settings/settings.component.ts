import { Component } from '@angular/core';
import { LocalSettingsService, ThemeMode } from '../../../core/services/local-settings.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
})
export class SettingsComponent {
  enableDashboardDebugInfo$: Observable<boolean>;
  enableFormDebugInfo$: Observable<boolean>;
  isDarkTheme$: Observable<boolean>;

  constructor(
    private localSettingsService: LocalSettingsService,
    private themeService: ThemeService
  ) {
    this.enableDashboardDebugInfo$ = this.localSettingsService.enableDashboardDebugInfo$;
    this.enableFormDebugInfo$ = this.localSettingsService.enableFormDebugInfo$;
    this.isDarkTheme$ = this.themeService.theme$.pipe(
      map((theme) => theme === 'dark')
    );
  }

  onDashboardDebugToggle(enabled: boolean): void {
    this.localSettingsService.setEnableDashboardDebugInfo(enabled);
  }

  onFormDebugToggle(enabled: boolean): void {
    this.localSettingsService.setEnableFormDebugInfo(enabled);
  }

  onThemeToggle(isDark: boolean): void {
    const theme: ThemeMode = isDark ? 'dark' : 'light';
    this.localSettingsService.setTheme(theme);
    this.themeService.setTheme(theme);
  }
}