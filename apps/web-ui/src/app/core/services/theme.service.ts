import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

interface LocalSettings {
  enableDashboardDebugInfo: boolean;
  enableFormDebugInfo: boolean;
  theme: ThemeMode;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'monorepo_kit_local_settings';
  private readonly DARK_THEME_CLASS = 'dark-theme';

  private themeSubject = new BehaviorSubject<ThemeMode>('light');

  public theme$ = this.themeSubject.asObservable();

  constructor() {
    // Clean up old theme key if it exists
    try {
      localStorage.removeItem('monorepo_kit-theme');
    } catch {
      // Ignore errors - localStorage may not be available
    }

    this.initializeTheme();
  }

  /**
   * Initialize theme from localStorage
   */
  private initializeTheme(): void {
    const savedTheme = this.getSavedTheme();
    this.setTheme(savedTheme, false);
  }

  /**
   * Get theme from localStorage
   */
  private getSavedTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const settings: LocalSettings = JSON.parse(stored);
        return settings.theme || 'light';
      }
    } catch {
      // Ignore errors - localStorage may not be available or data may be corrupted
    }
    return 'light';
  }

  /**
   * Set the theme and update DOM
   */
  setTheme(theme: ThemeMode, saveToStorage = true): void {
    this.themeSubject.next(theme);
    this.updateDOM(theme);
    if (saveToStorage) {
      this.saveTheme(theme);
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: ThemeMode): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let settings: LocalSettings;

      if (stored) {
        settings = JSON.parse(stored);
        settings.theme = theme;
      } else {
        settings = {
          enableDashboardDebugInfo: false,
          enableFormDebugInfo: false,
          theme: theme,
        };
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore errors - localStorage may not be available
    }
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }

  /**
   * Update DOM with theme class
   */
  private updateDOM(theme: ThemeMode): void {
    const body = document.body;

    if (theme === 'dark') {
      body.classList.add(this.DARK_THEME_CLASS);
    } else {
      body.classList.remove(this.DARK_THEME_CLASS);
    }
  }
}
