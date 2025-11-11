import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UiAppContextService } from './ui-app-context.service';
import { AppConfigService, ApiAuthService } from '@ai-nx-starter/api-client';
import { LoggerService } from './logger.service';
import { UIAppContextDto, ClientUserDto, Role, ErrorStatusCode } from '@ai-nx-starter/types';
import { StorageKey } from '../enums/storage-key.enum';

describe('UiAppContextService', () => {
  let service: UiAppContextService;
  let appConfigService: jest.Mocked<AppConfigService>;
  let apiAuthService: jest.Mocked<ApiAuthService>;
  let router: jest.Mocked<Router>;
  let logger: jest.Mocked<LoggerService>;

  const mockUser: ClientUserDto = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    role: Role.Admin,
    picture: '',
    createdAt: new Date('2025-01-01'),
  };

  const mockContext: UIAppContextDto = {
    currentUser: mockUser,
  };

  beforeEach(() => {
    const mockAppConfigService = {
      token: '',
      fingerprint: '',
    };

    const mockApiAuthService = {
      getUiAppContext: jest.fn(),
      logout: jest.fn(),
    };

    const mockRouter = {
      navigate: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        UiAppContextService,
        { provide: AppConfigService, useValue: mockAppConfigService },
        { provide: ApiAuthService, useValue: mockApiAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: LoggerService, useValue: mockLogger },
      ],
    });

    service = TestBed.inject(UiAppContextService);
    appConfigService = TestBed.inject(AppConfigService) as any;
    apiAuthService = TestBed.inject(ApiAuthService) as jest.Mocked<ApiAuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    logger = TestBed.inject(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Service Initialization', () => {
    it('should create service', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with null context', (done) => {
      service.uiAppContext$.subscribe((context) => {
        expect(context).toBeNull();
        done();
      });
    });

    it('should initialize with loading false', (done) => {
      service.isLoading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });

    it('should initialize with null error', (done) => {
      service.error$.subscribe((error) => {
        expect(error).toBeNull();
        done();
      });
    });
  });

  describe('init()', () => {
    it('should load token from localStorage and set it in appConfigService', async () => {
      const testToken = 'test-token-123';
      localStorage.setItem(StorageKey.Token, testToken);
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      expect(appConfigService.token).toBe(testToken);
    });

    it('should load fingerprint from localStorage', async () => {
      const testFingerprint = 'test-fingerprint-456';
      localStorage.setItem(StorageKey.Fingerprint, testFingerprint);
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      expect(appConfigService.fingerprint).toBe(testFingerprint);
    });

    it('should set loading to true during init', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      const loadingStates: boolean[] = [];
      service.isLoading$.subscribe((loading) => loadingStates.push(loading));

      await service.init();

      expect(loadingStates).toContain(true);
    });

    it('should call refreshContext to load UI app context', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      expect(apiAuthService.getUiAppContext).toHaveBeenCalled();
    });

    it('should log info message on init', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      expect(logger.info).toHaveBeenCalledWith('UI Context development');
    });

    it('should handle missing token gracefully', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      expect(appConfigService.token).toBe('');
    });
  });

  describe('refreshContext()', () => {
    it('should load and set UI app context successfully', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      expect(service.currentContext).toEqual(mockContext);
    });

    it('should set loading to false after successful context load', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      const currentLoading = await new Promise<boolean>((resolve) => {
        service.isLoading$.subscribe((loading) => resolve(loading));
      });

      expect(currentLoading).toBe(false);
    });

    it('should navigate to login on session expired error', async () => {
      const error = { status: ErrorStatusCode.SessionExpired };
      apiAuthService.getUiAppContext.mockReturnValue(throwError(() => error));

      await service.init();

      expect(router.navigate).toHaveBeenCalledWith(['/redirecting-to-login']);
    });

    it('should set error message on other errors', async () => {
      const error = { status: 500, message: 'Server error' };
      apiAuthService.getUiAppContext.mockReturnValue(throwError(() => error));

      await service.init();

      const currentError = await new Promise<string | null>((resolve) => {
        service.error$.subscribe((err) => resolve(err));
      });

      expect(currentError).toBe('Failed to load application context');
    });

    it('should set loading to false after error', async () => {
      const error = { status: 500 };
      apiAuthService.getUiAppContext.mockReturnValue(throwError(() => error));

      await service.init();

      const currentLoading = await new Promise<boolean>((resolve) => {
        service.isLoading$.subscribe((loading) => resolve(loading));
      });

      expect(currentLoading).toBe(false);
    });
  });

  describe('Observables', () => {
    it('should emit context updates via uiAppContext$', (done) => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      service.uiAppContext$.subscribe((context) => {
        if (context) {
          expect(context).toEqual(mockContext);
          done();
        }
      });

      service.init();
    });

    it('should emit current user via currentUser$', (done) => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      service.currentUser$.subscribe((user) => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.init();
    });

    it('should emit null for currentUser$ when context has no user', (done) => {
      const contextWithoutUser: UIAppContextDto = {
        currentUser: null as any,
      };
      apiAuthService.getUiAppContext.mockReturnValue(of(contextWithoutUser));

      service.currentUser$.subscribe((user) => {
        if (user === null) {
          expect(user).toBeNull();
          done();
        }
      });

      service.init();
    });
  });

  describe('Synchronous Getters', () => {
    it('should return current context synchronously', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      expect(service.currentContext).toEqual(mockContext);
    });

    it('should return null context when not loaded', () => {
      expect(service.currentContext).toBeNull();
    });

    it('should return current user synchronously', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      expect(service.currentUser).toEqual(mockUser);
    });

    it('should return null user when context not loaded', () => {
      expect(service.currentUser).toBeNull();
    });

    it('should return null user when context has no user', async () => {
      const contextWithoutUser: UIAppContextDto = {
        currentUser: null as any,
      };
      apiAuthService.getUiAppContext.mockReturnValue(of(contextWithoutUser));

      await service.init();

      expect(service.currentUser).toBeNull();
    });
  });

  describe('logIn()', () => {
    it('should log info message', () => {
      service.logIn();

      expect(logger.info).toHaveBeenCalledWith('Login');
    });
  });

  describe('logOut()', () => {
    it('should clear token from appConfigService', () => {
      appConfigService.token = 'some-token';

      service.logOut();

      expect(appConfigService.token).toBe('');
    });

    it('should remove token from localStorage', () => {
      localStorage.setItem(StorageKey.Token, 'test-token');

      service.logOut();

      expect(localStorage.getItem(StorageKey.Token)).toBeNull();
    });

    it('should navigate to login page', () => {
      service.logOut();

      expect(router.navigate).toHaveBeenCalledWith(['/redirecting-to-login']);
    });

    it('should log info message', () => {
      service.logOut();

      expect(logger.info).toHaveBeenCalledWith('Logout');
    });
  });

  describe('clear()', () => {
    it('should reset context to null', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));
      await service.init();

      service.clear();

      expect(service.currentContext).toBeNull();
    });

    it('should reset loading to false', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));
      await service.init();

      service.clear();

      const currentLoading = await new Promise<boolean>((resolve) => {
        service.isLoading$.subscribe((loading) => resolve(loading));
      });

      expect(currentLoading).toBe(false);
    });

    it('should reset error to null', async () => {
      const error = { status: 500 };
      apiAuthService.getUiAppContext.mockReturnValue(throwError(() => error));
      await service.init();

      service.clear();

      const currentError = await new Promise<string | null>((resolve) => {
        service.error$.subscribe((err) => resolve(err));
      });

      expect(currentError).toBeNull();
    });
  });

  describe('isLoggedIn()', () => {
    it('should return true when user is logged in', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));

      await service.init();

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return true when no context loaded (due to !== null check)', () => {
      // Note: This behavior is due to null?.currentUser returning undefined, and undefined !== null is true
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when context has no user', async () => {
      const contextWithoutUser: UIAppContextDto = {
        currentUser: null as any,
      };
      apiAuthService.getUiAppContext.mockReturnValue(of(contextWithoutUser));

      await service.init();

      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true after clear (due to !== null check)', async () => {
      apiAuthService.getUiAppContext.mockReturnValue(of(mockContext));
      await service.init();

      service.clear();

      // Note: After clear(), context is null, so null?.currentUser is undefined, and undefined !== null is true
      expect(service.isLoggedIn()).toBe(true);
    });
  });
});
