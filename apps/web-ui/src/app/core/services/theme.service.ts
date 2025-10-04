import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'medorion-theme';
  private readonly DARK_THEME_CLASS = 'dark-theme';

  private themeSubject = new BehaviorSubject<ThemeMode>('light');

  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    const savedTheme = this.getSavedTheme();
    const systemTheme = this.getSystemTheme();
    const initialTheme = savedTheme || systemTheme;

    this.setTheme(initialTheme);

    // Listen for system theme changes
    this.watchSystemTheme();
  }

  /**
   * Set the theme and update DOM
   */
  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    this.updateDOM(theme);
    this.saveTheme(theme);
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

  /**
   * Get saved theme from localStorage
   */
  private getSavedTheme(): ThemeMode | null {
    try {
      const saved = localStorage.getItem(this.THEME_KEY) as ThemeMode;
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch {
      return null;
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch {
      // localStorage may not be available
    }
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): ThemeMode {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * Watch for system theme changes
   */
  private watchSystemTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Only auto-switch if no saved preference
      mediaQuery.addEventListener('change', (e) => {
        if (!this.getSavedTheme()) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
}
