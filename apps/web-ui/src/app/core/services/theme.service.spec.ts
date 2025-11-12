import { TestBed } from '@angular/core/testing';
import { ThemeService, ThemeMode } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageMock: { [key: string]: string };
  let getItemSpy: jest.Mock;
  let setItemSpy: jest.Mock;
  let removeItemSpy: jest.Mock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    getItemSpy = jest.fn((key: string) => localStorageMock[key] || null);
    setItemSpy = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    removeItemSpy = jest.fn((key: string) => {
      delete localStorageMock[key];
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: removeItemSpy,
      },
      writable: true,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with light theme by default', (done) => {
    service.theme$.subscribe((theme) => {
      expect(theme).toBe('light');
      done();
    });
  });

  it('should set theme and update observable', (done) => {
    service.setTheme('dark');

    service.theme$.subscribe((theme) => {
      expect(theme).toBe('dark');
      done();
    });
  });

  it('should save theme to localStorage when saveToStorage is true', () => {
    service.setTheme('dark', true);

    const stored = localStorageMock['monorepo_kit_local_settings'];
    expect(stored).toBeDefined();
    const settings = JSON.parse(stored);
    expect(settings.theme).toBe('dark');
  });

  it('should not save theme to localStorage when saveToStorage is false', () => {
    service.setTheme('dark', false);

    const stored = localStorageMock['monorepo_kit_local_settings'];
    expect(stored).toBeUndefined();
  });

  it('should toggle theme from light to dark', () => {
    service.setTheme('light');
    service.toggleTheme();

    expect(service.getCurrentTheme()).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    service.setTheme('dark');
    service.toggleTheme();

    expect(service.getCurrentTheme()).toBe('light');
  });

  it('should return current theme', () => {
    service.setTheme('dark');
    expect(service.getCurrentTheme()).toBe('dark');

    service.setTheme('light');
    expect(service.getCurrentTheme()).toBe('light');
  });

  it('should check if theme is dark', () => {
    service.setTheme('dark');
    expect(service.isDark()).toBe(true);

    service.setTheme('light');
    expect(service.isDark()).toBe(false);
  });

  it('should add dark-theme class to body when dark theme is set', () => {
    service.setTheme('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  it('should remove dark-theme class from body when light theme is set', () => {
    document.body.classList.add('dark-theme');
    service.setTheme('light');
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('should load saved theme from localStorage on init', () => {
    // Set up localStorage with saved theme
    localStorageMock['monorepo_kit_local_settings'] = JSON.stringify({
      enableDashboardDebugInfo: false,
      enableFormDebugInfo: false,
      theme: 'dark',
    });

    // Create new service instance to trigger initialization
    const newService = new ThemeService();

    expect(newService.getCurrentTheme()).toBe('dark');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorageMock['monorepo_kit_local_settings'] = 'invalid json{';

    // Should not throw and default to light theme
    const newService = new ThemeService();
    expect(newService.getCurrentTheme()).toBe('light');
  });

  it('should remove old theme key on initialization', () => {
    expect(removeItemSpy).toHaveBeenCalledWith('monorepo_kit-theme');
  });

  it('should handle localStorage errors when saving theme', () => {
    setItemSpy.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    // Should not throw
    expect(() => service.setTheme('dark')).not.toThrow();
  });
});
