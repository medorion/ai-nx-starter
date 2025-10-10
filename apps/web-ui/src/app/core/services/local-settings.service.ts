import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

/**
 * Interface for local settings stored in browser's local storage
 */
export interface LocalSettings {
  enableDashboardDebugInfo: boolean;
  enableFormDebugInfo: boolean;
  theme: ThemeMode;
}

/**
 * Service for managing user session settings stored in local storage
 * Provides reactive observables for settings changes
 */
@Injectable({
  providedIn: 'root',
})
export class LocalSettingsService {
  private readonly STORAGE_KEY = 'monorepo_kit_local_settings';

  // Default settings
  private readonly DEFAULT_SETTINGS: LocalSettings = {
    enableDashboardDebugInfo: false,
    enableFormDebugInfo: false,
    theme: 'light',
  };

  // BehaviorSubjects for reactive settings
  private settingsSubject: BehaviorSubject<LocalSettings>;

  // Public observables
  public settings$: Observable<LocalSettings>;
  public enableDashboardDebugInfo$: Observable<boolean>;
  public enableFormDebugInfo$: Observable<boolean>;
  public theme$: Observable<ThemeMode>;

  constructor() {
    // Initialize with settings from local storage or defaults
    const initialSettings = this.loadSettings();
    this.settingsSubject = new BehaviorSubject<LocalSettings>(initialSettings);

    // Create public observables
    this.settings$ = this.settingsSubject.asObservable();
    this.enableDashboardDebugInfo$ = new Observable((observer) => {
      this.settings$.subscribe((settings) => observer.next(settings.enableDashboardDebugInfo));
    });
    this.enableFormDebugInfo$ = new Observable((observer) => {
      this.settings$.subscribe((settings) => observer.next(settings.enableFormDebugInfo));
    });
    this.theme$ = new Observable((observer) => {
      this.settings$.subscribe((settings) => observer.next(settings.theme));
    });
  }

  /**
   * Load settings from local storage
   */
  private loadSettings(): LocalSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...this.DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Error loading local settings:', error);
    }
    return { ...this.DEFAULT_SETTINGS };
  }

  /**
   * Save settings to local storage
   */
  private saveSettings(settings: LocalSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      this.settingsSubject.next(settings);
    } catch (error) {
      console.error('Error saving local settings:', error);
    }
  }

  /**
   * Get current settings snapshot
   */
  getSettings(): LocalSettings {
    return { ...this.settingsSubject.value };
  }

  /**
   * Update all settings at once
   */
  updateSettings(settings: Partial<LocalSettings>): void {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    this.saveSettings(updatedSettings);
  }

  /**
   * Enable or disable dashboard debug info
   */
  setEnableDashboardDebugInfo(enabled: boolean): void {
    this.updateSettings({ enableDashboardDebugInfo: enabled });
  }

  /**
   * Enable or disable form debug info
   */
  setEnableFormDebugInfo(enabled: boolean): void {
    this.updateSettings({ enableFormDebugInfo: enabled });
  }

  /**
   * Get current value of enableDashboardDebugInfo
   */
  getEnableDashboardDebugInfo(): boolean {
    return this.settingsSubject.value.enableDashboardDebugInfo;
  }

  /**
   * Get current value of enableFormDebugInfo
   */
  getEnableFormDebugInfo(): boolean {
    return this.settingsSubject.value.enableFormDebugInfo;
  }

  /**
   * Set theme
   */
  setTheme(theme: ThemeMode): void {
    this.updateSettings({ theme });
  }

  /**
   * Get current theme
   */
  getTheme(): ThemeMode {
    return this.settingsSubject.value.theme;
  }

  /**
   * Reset all settings to defaults
   */
  resetToDefaults(): void {
    this.saveSettings({ ...this.DEFAULT_SETTINGS });
  }

  /**
   * Clear all settings from local storage
   */
  clearSettings(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.settingsSubject.next({ ...this.DEFAULT_SETTINGS });
    } catch (error) {
      console.error('Error clearing local settings:', error);
    }
  }
}
