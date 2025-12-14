import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';
import { AuthorizeGuard } from './authorize.guard';
import { SessionService } from '../services/session.service';
import { SessionInfo } from '../interfaces/session-info.interface';
import { SessionExpiredException } from '../exceptions/session-expired.exception';
import { Role } from '@ai-nx-starter/types';

describe('AuthorizeGuard', () => {
  let guard: AuthorizeGuard;
  let sessionService: jest.Mocked<SessionService>;
  let reflector: jest.Mocked<Reflector>;
  let logger: jest.Mocked<PinoLogger>;

  const mockSessionInfo: SessionInfo = {
    userId: 'user-123',
    email: 'admin@example.com',
    phone: '+1234567890',
    role: Role.Admin,
    picture: '',
    createdAt: Date.now(),
    creationDate: Date.now(),
    expiresAt: Date.now() + 3600000, // 1 hour from now
    serverVersion: '1.0.0',
    fingerprint: 'fingerprint-123',
    clientId: 'client-123',
  };

  const mockRequest = {
    headers: {
      authorization: 'Bearer valid-token',
    },
    url: '/api/test',
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
    getHandler: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const mockSessionService = {
      getSession: jest.fn(),
      killSessionByToken: jest.fn(),
    };

    const mockReflector = {
      get: jest.fn(),
    };

    const mockLogger = {
      setContext: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizeGuard,
        { provide: SessionService, useValue: mockSessionService },
        { provide: Reflector.name, useValue: mockReflector },
        { provide: PinoLogger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get<AuthorizeGuard>(AuthorizeGuard);
    sessionService = module.get(SessionService);
    reflector = module.get(Reflector.name);
    logger = module.get(PinoLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access with valid session token and sufficient role', async () => {
      reflector.get.mockReturnValueOnce(undefined); // ignoreAuthorization
      reflector.get.mockReturnValueOnce(Role.Admin); // role
      sessionService.getSession.mockResolvedValue(mockSessionInfo);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(sessionService.getSession).toHaveBeenCalledWith('valid-token');
      expect(mockRequest).toHaveProperty('session', mockSessionInfo);
    });

    it('should bypass authorization when ignoreAuthorization is true (no token)', async () => {
      reflector.get.mockReturnValueOnce(true); // ignoreAuthorization

      const contextWithoutAuth = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
            url: '/api/test',
          }),
        }),
      } as unknown as ExecutionContext;

      const result = await guard.canActivate(contextWithoutAuth);

      expect(result).toBe(true);
      expect(sessionService.getSession).not.toHaveBeenCalled();
    });

    it('should set session when ignoreAuthorization is true but valid token provided', async () => {
      reflector.get.mockReturnValueOnce(true); // ignoreAuthorization
      sessionService.getSession.mockResolvedValue(mockSessionInfo);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(sessionService.getSession).toHaveBeenCalledWith('valid-token');
      expect(mockRequest).toHaveProperty('session', mockSessionInfo);
    });

    it('should throw SessionExpiredException when no token provided', async () => {
      reflector.get.mockReturnValueOnce(undefined); // ignoreAuthorization

      const contextWithoutToken = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
            url: '/api/test',
          }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(contextWithoutToken)).rejects.toThrow(new SessionExpiredException('Session token not found'));
      expect(logger.warn).toHaveBeenCalledWith('Session token not found');
    });

    it('should throw SessionExpiredException when session not found', async () => {
      reflector.get.mockReturnValueOnce(undefined); // ignoreAuthorization
      sessionService.getSession.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(new SessionExpiredException('Session not found'));
      expect(logger.warn).toHaveBeenCalledWith('Session not found');
    });

    it('should throw ForbiddenException when user role is insufficient', async () => {
      const userSessionInfo = { ...mockSessionInfo, role: Role.User };

      reflector.get.mockReturnValueOnce(undefined); // ignoreAuthorization
      reflector.get.mockReturnValueOnce(Role.Root); // required role
      sessionService.getSession.mockResolvedValue(userSessionInfo);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(ForbiddenException);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Validate user role, user admin@example.com does not have required role!'),
      );
    });

    it('should default to Root role when no role specified', async () => {
      const userSessionInfo = { ...mockSessionInfo, role: Role.User };

      reflector.get.mockReturnValueOnce(undefined); // ignoreAuthorization
      reflector.get.mockReturnValueOnce(undefined); // role (defaults to Root)
      sessionService.getSession.mockResolvedValue(userSessionInfo);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(ForbiddenException);
    });

    it('should throw SessionExpiredException when session is expired', async () => {
      const expiredSessionInfo = {
        ...mockSessionInfo,
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };

      reflector.get.mockReturnValueOnce(undefined); // ignoreAuthorization
      reflector.get.mockReturnValueOnce(Role.Admin); // role
      sessionService.getSession.mockResolvedValue(expiredSessionInfo);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new SessionExpiredException('Session Expired, no token payload'),
      );
      expect(sessionService.killSessionByToken).toHaveBeenCalledWith(expiredSessionInfo.userId);
      expect(logger.error).toHaveBeenCalledWith('Can Activate, Session Expired, no token payload');
    });

    it('should extract token from Bearer authorization header correctly', async () => {
      const customRequest = {
        headers: {
          authorization: 'Bearer custom-token-123',
        },
        url: '/api/test',
      };

      const customContext = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(customRequest),
        }),
      } as unknown as ExecutionContext;

      reflector.get.mockReturnValueOnce(undefined); // ignoreAuthorization
      reflector.get.mockReturnValueOnce(Role.Admin); // role
      sessionService.getSession.mockResolvedValue(mockSessionInfo);

      await guard.canActivate(customContext);

      expect(sessionService.getSession).toHaveBeenCalledWith('custom-token-123');
    });
  });

  describe('isUserRoleValid', () => {
    it('should return true when user has exact required role', () => {
      const result = guard.isUserRoleValid(Role.Admin, mockSessionInfo);

      expect(result).toBe(true);
    });

    it('should return true when user has higher role than required (Root > Admin)', () => {
      const rootSessionInfo = { ...mockSessionInfo, role: Role.Root };

      const result = guard.isUserRoleValid(Role.Admin, rootSessionInfo);

      expect(result).toBe(true);
    });

    it('should return false when user has lower role than required', () => {
      const userSessionInfo = { ...mockSessionInfo, role: Role.User };

      const result = guard.isUserRoleValid(Role.Admin, userSessionInfo);

      expect(result).toBe(false);
      // User role (weight 60) < Admin role (weight 90), so it logs info about insufficient role
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Validate user role, user'));
    });

    it('should return false when required role is invalid', () => {
      const result = guard.isUserRoleValid('InvalidRole' as Role, mockSessionInfo);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Validate user role, InvalidRole is not valid value for UserRole.');
    });

    it('should return false when user role is invalid', () => {
      const invalidSessionInfo = { ...mockSessionInfo, role: 'InvalidRole' as Role };

      const result = guard.isUserRoleValid(Role.Admin, invalidSessionInfo);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Validate user role, InvalidRole is not valid value for UserRole.');
    });

    it('should return true when user has User role and User role is required', () => {
      // User role has weight 60, and 60 >= 60
      const userSessionInfo = { ...mockSessionInfo, role: Role.User };

      const result = guard.isUserRoleValid(Role.User, userSessionInfo);

      expect(result).toBe(true);
    });
  });
});
