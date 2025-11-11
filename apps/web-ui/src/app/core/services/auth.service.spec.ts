import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiAuthService, AppConfigService } from '@ai-nx-starter/api-client';
import { UiAppContextService } from './ui-app-context.service';
import { LoggerService } from './logger.service';
import { LoginUserDto, ClientUserDto, Role } from '@ai-nx-starter/types';
import { StorageKey } from '../enums/storage-key.enum';

describe('AuthService', () => {
  let service: AuthService;
  let apiAuthService: jest.Mocked<ApiAuthService>;
  let appConfigService: jest.Mocked<AppConfigService>;
  let uiAppContextService: jest.Mocked<UiAppContextService>;
  let router: jest.Mocked<Router>;
  let logger: jest.Mocked<LoggerService>;

  const mockClientUserDto: ClientUserDto = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: Role.Admin,
    phone: '+1234567890',
    picture: '',
  };

  const mockLoginResponse = {
    token: 'test-token-abc123',
    user: mockClientUserDto,
  };

  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
    Storage.prototype.clear = jest.fn();

    const mockApiAuthService = {
      login: jest.fn(),
      logout: jest.fn(),
    };

    const mockAppConfigService = {
      token: '',
    };

    const mockUiAppContextService = {
      init: jest.fn(),
      clear: jest.fn(),
    };

    const mockRouter = {
      navigate: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiAuthService, useValue: mockApiAuthService },
        { provide: AppConfigService, useValue: mockAppConfigService },
        { provide: UiAppContextService, useValue: mockUiAppContextService },
        { provide: Router, useValue: mockRouter },
        { provide: LoggerService, useValue: mockLogger },
      ],
    });

    service = TestBed.inject(AuthService);
    apiAuthService = TestBed.inject(ApiAuthService) as jest.Mocked<ApiAuthService>;
    appConfigService = TestBed.inject(AppConfigService) as jest.Mocked<AppConfigService>;
    uiAppContextService = TestBed.inject(UiAppContextService) as jest.Mocked<UiAppContextService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    logger = TestBed.inject(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginUserDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login successfully and navigate to home', async () => {
      apiAuthService.login.mockReturnValue(of(mockLoginResponse));
      uiAppContextService.init.mockResolvedValue();

      await service.login(loginDto);

      expect(apiAuthService.login).toHaveBeenCalledWith(loginDto, '');
      expect(appConfigService.token).toBe('test-token-abc123');
      expect(localStorage.setItem).toHaveBeenCalledWith(StorageKey.Token, 'test-token-abc123');
      expect(logger.info).toHaveBeenCalledWith('Login successful', { email: loginDto.email });
      expect(uiAppContextService.init).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should store token in localStorage for persistence', async () => {
      apiAuthService.login.mockReturnValue(of(mockLoginResponse));
      uiAppContextService.init.mockResolvedValue();

      await service.login(loginDto);

      expect(localStorage.setItem).toHaveBeenCalledWith(StorageKey.Token, 'test-token-abc123');
    });

    it('should initialize UI app context after successful login', async () => {
      apiAuthService.login.mockReturnValue(of(mockLoginResponse));
      uiAppContextService.init.mockResolvedValue();

      await service.login(loginDto);

      expect(uiAppContextService.init).toHaveBeenCalledTimes(1);
    });

    it('should navigate to home page after successful login', async () => {
      apiAuthService.login.mockReturnValue(of(mockLoginResponse));
      uiAppContextService.init.mockResolvedValue();

      await service.login(loginDto);

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should throw error and log when login API fails', async () => {
      const error = new Error('Invalid credentials');
      apiAuthService.login.mockReturnValue(throwError(() => error));

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(logger.error).toHaveBeenCalledWith('Login failed', error);
      expect(appConfigService.token).not.toBe('test-token-abc123');
      expect(uiAppContextService.init).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not store token when login fails', async () => {
      const error = new Error('Invalid credentials');
      apiAuthService.login.mockReturnValue(throwError(() => error));

      try {
        await service.login(loginDto);
      } catch {
        // Expected error
      }

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle UI context initialization failure', async () => {
      apiAuthService.login.mockReturnValue(of(mockLoginResponse));
      uiAppContextService.init.mockRejectedValue(new Error('Context init failed'));

      await expect(service.login(loginDto)).rejects.toThrow('Context init failed');

      // Token should still be stored even if context init fails
      expect(appConfigService.token).toBe('test-token-abc123');
      expect(localStorage.setItem).toHaveBeenCalledWith(StorageKey.Token, 'test-token-abc123');
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Set up initial logged-in state
      appConfigService.token = 'existing-token';
      (localStorage.setItem as jest.Mock)(StorageKey.Token, 'existing-token');
      (localStorage.setItem as jest.Mock)(StorageKey.LoggedInUser, '{"id":"user-123"}');
    });

    it('should logout successfully and clear all session data', async () => {
      apiAuthService.logout.mockReturnValue(of(void 0));

      await service.logout();

      expect(apiAuthService.logout).toHaveBeenCalled();
      expect(appConfigService.token).toBe('');
      expect(localStorage.removeItem).toHaveBeenCalledWith(StorageKey.Token);
      expect(localStorage.removeItem).toHaveBeenCalledWith(StorageKey.LoggedInUser);
      expect(uiAppContextService.clear).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Logout successful');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should clear token from AppConfigService', async () => {
      apiAuthService.logout.mockReturnValue(of(void 0));

      await service.logout();

      expect(appConfigService.token).toBe('');
    });

    it('should remove token from localStorage', async () => {
      apiAuthService.logout.mockReturnValue(of(void 0));

      await service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith(StorageKey.Token);
    });

    it('should remove logged-in user data from localStorage', async () => {
      apiAuthService.logout.mockReturnValue(of(void 0));

      await service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith(StorageKey.LoggedInUser);
    });

    it('should clear UI app context', async () => {
      apiAuthService.logout.mockReturnValue(of(void 0));

      await service.logout();

      expect(uiAppContextService.clear).toHaveBeenCalled();
    });

    it('should navigate to login page', async () => {
      apiAuthService.logout.mockReturnValue(of(void 0));

      await service.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should clear local session even when logout API fails', async () => {
      const error = new Error('Network error');
      apiAuthService.logout.mockReturnValue(throwError(() => error));

      await service.logout();

      expect(logger.warn).toHaveBeenCalledWith('Logout API call failed, clearing local session anyway', error);
      expect(appConfigService.token).toBe('');
      expect(localStorage.removeItem).toHaveBeenCalledWith(StorageKey.Token);
      expect(localStorage.removeItem).toHaveBeenCalledWith(StorageKey.LoggedInUser);
      expect(uiAppContextService.clear).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should log warning when API call fails but continue cleanup', async () => {
      const error = new Error('Server unreachable');
      apiAuthService.logout.mockReturnValue(throwError(() => error));

      await service.logout();

      expect(logger.warn).toHaveBeenCalledWith('Logout API call failed, clearing local session anyway', error);
      expect(logger.info).toHaveBeenCalledWith('Logout successful');
    });

    it('should not throw error even when API fails', async () => {
      const error = new Error('Logout API failed');
      apiAuthService.logout.mockReturnValue(throwError(() => error));

      await expect(service.logout()).resolves.toBeUndefined();
    });

    it('should always clear session data regardless of API response', async () => {
      apiAuthService.logout.mockReturnValue(throwError(() => new Error('Failed')));

      await service.logout();

      expect(appConfigService.token).toBe('');
      expect(uiAppContextService.clear).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
