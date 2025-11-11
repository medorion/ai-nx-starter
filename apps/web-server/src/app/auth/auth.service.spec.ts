import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AuthService } from './auth.service';
import { AuthMapperService } from './auth-mapper.service';
import { SessionService } from '@ai-nx-starter/backend-common';
import { UserDbService } from '@ai-nx-starter/data-access-layer';
import { SessionInfo, SessionExpiredException, AppErrorException } from '@ai-nx-starter/backend-common';
import { LoginUserDto, ClientUserDto, Role, UIAppContextDto } from '@ai-nx-starter/types';
import { User } from '@ai-nx-starter/data-access-layer';
import { ObjectId } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let authMapperService: jest.Mocked<AuthMapperService>;
  let sessionService: jest.Mocked<SessionService>;
  let userDbService: jest.Mocked<UserDbService>;
  let logger: jest.Mocked<PinoLogger>;

  const mockUser: User = {
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: '$2b$10$hashedPasswordHere',
    role: Role.Admin,
    phone: '+1234567890',
    picture: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockClientUserDto: ClientUserDto = {
    id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: Role.Admin,
    phone: '+1234567890',
    picture: '',
  };

  const mockSessionInfo: SessionInfo = {
    userId: '507f1f77bcf86cd799439011',
    email: 'john@example.com',
    phone: '+1234567890',
    role: Role.Admin,
    picture: '',
    createdAt: Date.now(),
    creationDate: Date.now(),
    expiresAt: Date.now() + 3600000,
    serverVersion: '1.0.0',
    fingerprint: 'fingerprint-123',
    clientId: 'client-123',
  };

  beforeEach(async () => {
    const mockAuthMapperService = {
      mapSessionInfoToClientUserDto: jest.fn(),
    };

    const mockSessionService = {
      createSessionWithToken: jest.fn(),
      getSession: jest.fn(),
      killSessionByToken: jest.fn(),
    };

    const mockUserDbService = {
      findByEmailWithPassword: jest.fn(),
      verifyPassword: jest.fn(),
      findById: jest.fn(),
    };

    const mockLogger = {
      setContext: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthMapperService, useValue: mockAuthMapperService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: UserDbService, useValue: mockUserDbService },
        { provide: PinoLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authMapperService = module.get(AuthMapperService);
    sessionService = module.get(SessionService);
    userDbService = module.get(UserDbService);
    logger = module.get(PinoLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginUserDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const userIp = '192.168.1.1';

    it('should login successfully with valid credentials', async () => {
      userDbService.findByEmailWithPassword.mockResolvedValue(mockUser);
      userDbService.verifyPassword.mockResolvedValue(true);
      userDbService.findById.mockResolvedValue(mockUser);
      authMapperService.mapSessionInfoToClientUserDto.mockReturnValue(mockClientUserDto);
      sessionService.createSessionWithToken.mockResolvedValue('generated-token');

      const result = await service.login(loginDto, userIp);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user', mockClientUserDto);
      expect(result.token).toHaveLength(64); // randomBytes(32).toString('hex')

      expect(userDbService.findByEmailWithPassword).toHaveBeenCalledWith(loginDto.email);
      expect(userDbService.verifyPassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(sessionService.createSessionWithToken).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
        userIp,
        expect.any(String),
        2592000, // SESSION_TTL
      );
      expect(logger.info).toHaveBeenCalledWith(`User logged in successfully: ${mockUser.email}`);
    });

    it('should create session with correct expiration time (30 days)', async () => {
      userDbService.findByEmailWithPassword.mockResolvedValue(mockUser);
      userDbService.verifyPassword.mockResolvedValue(true);
      userDbService.findById.mockResolvedValue(mockUser);
      authMapperService.mapSessionInfoToClientUserDto.mockReturnValue(mockClientUserDto);

      const beforeLogin = Date.now();
      await service.login(loginDto, userIp);
      const afterLogin = Date.now();

      const sessionInfoCall = sessionService.createSessionWithToken.mock.calls[0][0] as SessionInfo;
      const expectedExpiry = 2592000 * 1000; // 30 days in milliseconds

      expect(sessionInfoCall.expiresAt).toBeGreaterThanOrEqual(beforeLogin + expectedExpiry);
      expect(sessionInfoCall.expiresAt).toBeLessThanOrEqual(afterLogin + expectedExpiry);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userDbService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login(loginDto, userIp)).rejects.toThrow(new UnauthorizedException('Invalid email or password'));

      expect(logger.warn).toHaveBeenCalledWith(`Login attempt failed: user not found for email ${loginDto.email}`);
      expect(userDbService.verifyPassword).not.toHaveBeenCalled();
      expect(sessionService.createSessionWithToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      userDbService.findByEmailWithPassword.mockResolvedValue(mockUser);
      userDbService.verifyPassword.mockResolvedValue(false);

      await expect(service.login(loginDto, userIp)).rejects.toThrow(new UnauthorizedException('Invalid email or password'));

      expect(logger.warn).toHaveBeenCalledWith(`Login attempt failed: invalid password for email ${loginDto.email}`);
      expect(sessionService.createSessionWithToken).not.toHaveBeenCalled();
    });

    it('should generate unique tokens for each login', async () => {
      userDbService.findByEmailWithPassword.mockResolvedValue(mockUser);
      userDbService.verifyPassword.mockResolvedValue(true);
      userDbService.findById.mockResolvedValue(mockUser);
      authMapperService.mapSessionInfoToClientUserDto.mockReturnValue(mockClientUserDto);

      const result1 = await service.login(loginDto, userIp);
      const result2 = await service.login(loginDto, userIp);

      expect(result1.token).not.toBe(result2.token);
      expect(result1.token).toHaveLength(64);
      expect(result2.token).toHaveLength(64);
    });

    it('should generate unique fingerprint and clientId for each session', async () => {
      userDbService.findByEmailWithPassword.mockResolvedValue(mockUser);
      userDbService.verifyPassword.mockResolvedValue(true);
      userDbService.findById.mockResolvedValue(mockUser);
      authMapperService.mapSessionInfoToClientUserDto.mockReturnValue(mockClientUserDto);

      await service.login(loginDto, userIp);
      await service.login(loginDto, userIp);

      const session1 = sessionService.createSessionWithToken.mock.calls[0][0] as SessionInfo;
      const session2 = sessionService.createSessionWithToken.mock.calls[1][0] as SessionInfo;

      expect(session1.fingerprint).not.toBe(session2.fingerprint);
      expect(session1.clientId).not.toBe(session2.clientId);
      expect(session1.fingerprint).toHaveLength(32); // randomBytes(16).toString('hex')
      expect(session1.clientId).toHaveLength(32);
    });
  });

  describe('getUiAppContext', () => {
    it('should return UI app context with user DTO when session exists', async () => {
      authMapperService.mapSessionInfoToClientUserDto.mockReturnValue(mockClientUserDto);

      const result: UIAppContextDto = await service.getUiAppContext(mockSessionInfo);

      expect(result).toEqual({
        currentUser: mockClientUserDto,
      });
      expect(authMapperService.mapSessionInfoToClientUserDto).toHaveBeenCalledWith(mockSessionInfo);
    });

    it('should throw SessionExpiredException when session is null', async () => {
      await expect(service.getUiAppContext(null as any)).rejects.toThrow(
        new SessionExpiredException('Session does not exist, must log in first'),
      );

      expect(logger.error).toHaveBeenCalledWith('Session does not exist, must log in first');
      expect(authMapperService.mapSessionInfoToClientUserDto).not.toHaveBeenCalled();
    });

    it('should throw SessionExpiredException when session is undefined', async () => {
      await expect(service.getUiAppContext(undefined as any)).rejects.toThrow(
        new SessionExpiredException('Session does not exist, must log in first'),
      );
    });
  });

  describe('logout', () => {
    const sessionToken = 'valid-session-token';

    it('should logout successfully and kill session', async () => {
      sessionService.killSessionByToken.mockResolvedValue();

      await service.logout(sessionToken, mockSessionInfo);

      expect(sessionService.killSessionByToken).toHaveBeenCalledWith(sessionToken);
      expect(logger.info).toHaveBeenCalledWith(`User logged out successfully: ${mockSessionInfo.email}`);
    });

    it('should throw AppErrorException when session is null', async () => {
      await expect(service.logout(sessionToken, null as any)).rejects.toThrow(
        new AppErrorException('Session does not exist, must log in first'),
      );

      expect(logger.warn).toHaveBeenCalledWith('Logout attempt with no session');
      expect(sessionService.killSessionByToken).not.toHaveBeenCalled();
    });

    it('should throw AppErrorException when session is undefined', async () => {
      await expect(service.logout(sessionToken, undefined as any)).rejects.toThrow(
        new AppErrorException('Session does not exist, must log in first'),
      );

      expect(sessionService.killSessionByToken).not.toHaveBeenCalled();
    });

    it('should handle session service errors gracefully', async () => {
      sessionService.killSessionByToken.mockRejectedValue(new Error('Redis connection error'));

      await expect(service.logout(sessionToken, mockSessionInfo)).rejects.toThrow('Redis connection error');

      expect(sessionService.killSessionByToken).toHaveBeenCalledWith(sessionToken);
    });
  });
});
