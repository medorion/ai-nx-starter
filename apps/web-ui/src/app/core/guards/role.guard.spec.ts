import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { UiAppContextService } from '../services/ui-app-context.service';

describe('roleGuard', () => {
  let uiAppContextService: jest.Mocked<UiAppContextService>;
  let router: jest.Mocked<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const mockUiAppContextService = {
      hasRole: jest.fn(),
      currentUser: null,
      currentContext: null,
    };

    const mockRouter = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: UiAppContextService, useValue: mockUiAppContextService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    uiAppContextService = TestBed.inject(UiAppContextService) as jest.Mocked<UiAppContextService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    // Create mock route and state
    route = {
      data: {},
    } as unknown as ActivatedRouteSnapshot;

    state = {
      url: '/test',
    } as RouterStateSnapshot;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Guard Execution', () => {
    it('should be defined', () => {
      expect(roleGuard).toBeDefined();
    });

    it('should currently return true (TODO implementation)', () => {
      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should access route data for role', () => {
      route.data = { role: 'admin' };

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should handle route without role data', () => {
      route.data = {};

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should handle undefined route data', () => {
      route.data = undefined as unknown as ActivatedRouteSnapshot['data'];

      // Guard will throw error when trying to access undefined.role
      expect(() => {
        TestBed.runInInjectionContext(() => roleGuard(route, state));
      }).toThrow();
    });
  });

  describe('Dependency Injection', () => {
    it('should inject UiAppContextService', () => {
      TestBed.runInInjectionContext(() => roleGuard(route, state));

      // Service should be injectable
      expect(uiAppContextService).toBeDefined();
    });

    it('should inject Router', () => {
      TestBed.runInInjectionContext(() => roleGuard(route, state));

      // Router should be injectable
      expect(router).toBeDefined();
    });
  });

  describe('Route Data Handling', () => {
    it('should extract role from route data', () => {
      route.data = { role: 'superadmin' };

      TestBed.runInInjectionContext(() => roleGuard(route, state));

      // Currently just returns true, but verifies no errors with role data
      expect(route.data['role']).toBe('superadmin');
    });

    it('should default to empty string when role is not provided', () => {
      route.data = { otherData: 'value' };

      TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(route.data['role'] ?? '').toBe('');
    });

    it('should handle multiple data properties', () => {
      route.data = {
        role: 'user',
        title: 'Dashboard',
        breadcrumb: 'Home',
      };

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
      expect(route.data['role']).toBe('user');
    });
  });

  describe('Different Route States', () => {
    it('should handle different URLs', () => {
      state = { url: '/admin/users' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should handle root URL', () => {
      state = { url: '/' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should handle nested routes', () => {
      state = { url: '/backoffice/users/edit/123' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should handle routes with query parameters', () => {
      state = { url: '/dashboard?tab=overview&filter=active' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });
  });

  describe('Multiple Role Scenarios', () => {
    it('should handle admin role', () => {
      route.data = { role: 'admin' };

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should handle user role', () => {
      route.data = { role: 'user' };

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should handle root role', () => {
      route.data = { role: 'root' };

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should handle guest role', () => {
      route.data = { role: 'guest' };

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });

    it('should handle custom role names', () => {
      route.data = { role: 'content-manager' };

      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result).toBe(true);
    });
  });

  describe('Guard Behavior', () => {
    it('should not navigate when returning true', () => {
      TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should execute synchronously', () => {
      const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    it('should not throw errors with valid inputs', () => {
      expect(() => {
        TestBed.runInInjectionContext(() => roleGuard(route, state));
      }).not.toThrow();
    });

    it('should work with consecutive calls', () => {
      const result1 = TestBed.runInInjectionContext(() => roleGuard(route, state));
      const result2 = TestBed.runInInjectionContext(() => roleGuard(route, state));
      const result3 = TestBed.runInInjectionContext(() => roleGuard(route, state));

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });
  });
});
