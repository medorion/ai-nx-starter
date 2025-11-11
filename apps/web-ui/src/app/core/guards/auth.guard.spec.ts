import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { UiAppContextService } from '../services/ui-app-context.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let uiAppContextService: jest.Mocked<UiAppContextService>;
  let router: jest.Mocked<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const mockUiAppContextService = {
      isLoggedIn: jest.fn(),
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

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/protected-route' } as RouterStateSnapshot;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when user is logged in', () => {
    uiAppContextService.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(uiAppContextService.isLoggedIn).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to login when user is not logged in', () => {
    uiAppContextService.isLoggedIn.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(false);
    expect(uiAppContextService.isLoggedIn).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/redirecting-to-login'], {
      queryParams: { returnUrl: '/protected-route' },
    });
  });

  it('should include returnUrl query parameter when redirecting', () => {
    uiAppContextService.isLoggedIn.mockReturnValue(false);
    mockState = { url: '/admin/dashboard' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(router.navigate).toHaveBeenCalledWith(['/redirecting-to-login'], {
      queryParams: { returnUrl: '/admin/dashboard' },
    });
  });

  it('should handle root route URL', () => {
    uiAppContextService.isLoggedIn.mockReturnValue(false);
    mockState = { url: '/' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(router.navigate).toHaveBeenCalledWith(['/redirecting-to-login'], {
      queryParams: { returnUrl: '/' },
    });
  });

  it('should handle URL with query parameters', () => {
    uiAppContextService.isLoggedIn.mockReturnValue(false);
    mockState = { url: '/users?page=2&sort=name' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(router.navigate).toHaveBeenCalledWith(['/redirecting-to-login'], {
      queryParams: { returnUrl: '/users?page=2&sort=name' },
    });
  });

  it('should handle URL with fragments', () => {
    uiAppContextService.isLoggedIn.mockReturnValue(false);
    mockState = { url: '/profile#settings' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(router.navigate).toHaveBeenCalledWith(['/redirecting-to-login'], {
      queryParams: { returnUrl: '/profile#settings' },
    });
  });

  it('should always check login status before allowing access', () => {
    uiAppContextService.isLoggedIn.mockReturnValue(true);

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(uiAppContextService.isLoggedIn).toHaveBeenCalledTimes(1);
  });

  it('should not navigate when user is logged in', () => {
    uiAppContextService.isLoggedIn.mockReturnValue(true);

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
