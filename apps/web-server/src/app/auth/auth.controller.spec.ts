import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionInfo } from '@ai-nx-starter/backend-common';
import { LoginUserDto, ClientUserDto, Role, UIAppContextDto } from '@ai-nx-starter/types';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

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
    const mockAuthService = {
      login: jest.fn(),
      getUiAppContext: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginUserDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should call authService.login with correct parameters using IP from @Ip decorator', async () => {
      const mockRequest = { ip: '192.168.1.1' } as Request;
      const expectedResponse = {
        token: 'generated-token',
        user: mockClientUserDto,
      };

      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto, '192.168.1.1', mockRequest);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto, '192.168.1.1');
    });

    it('should use request.ip when @Ip decorator returns undefined', async () => {
      const mockRequest = { ip: '10.0.0.1' } as Request;
      const expectedResponse = {
        token: 'generated-token',
        user: mockClientUserDto,
      };

      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto, undefined as any, mockRequest);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto, '10.0.0.1');
    });

    it('should default to 127.0.0.1 when no IP available', async () => {
      const mockRequest = {} as Request;
      const expectedResponse = {
        token: 'generated-token',
        user: mockClientUserDto,
      };

      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto, undefined as any, mockRequest);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto, '127.0.0.1');
    });

    it('should return token and user DTO on successful login', async () => {
      const mockRequest = { ip: '192.168.1.1' } as Request;
      const expectedResponse = {
        token: 'abc123token',
        user: mockClientUserDto,
      };

      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto, '192.168.1.1', mockRequest);

      expect(result).toHaveProperty('token', 'abc123token');
      expect(result).toHaveProperty('user', mockClientUserDto);
    });

    it('should propagate errors from authService.login', async () => {
      const mockRequest = { ip: '192.168.1.1' } as Request;
      const error = new Error('Invalid credentials');

      authService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto, '192.168.1.1', mockRequest)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUiAppContext', () => {
    it('should call authService.getUiAppContext with session info', async () => {
      const expectedContext: UIAppContextDto = {
        currentUser: mockClientUserDto,
      };

      authService.getUiAppContext.mockResolvedValue(expectedContext);

      const result = await controller.getUiAppContext(mockSessionInfo);

      expect(result).toEqual(expectedContext);
      expect(authService.getUiAppContext).toHaveBeenCalledWith(mockSessionInfo);
    });

    it('should return UI app context with current user', async () => {
      const expectedContext: UIAppContextDto = {
        currentUser: mockClientUserDto,
      };

      authService.getUiAppContext.mockResolvedValue(expectedContext);

      const result = await controller.getUiAppContext(mockSessionInfo);

      expect(result.currentUser).toEqual(mockClientUserDto);
    });

    it('should propagate errors from authService.getUiAppContext', async () => {
      const error = new Error('Session expired');

      authService.getUiAppContext.mockRejectedValue(error);

      await expect(controller.getUiAppContext(mockSessionInfo)).rejects.toThrow('Session expired');
    });
  });

  describe('logout', () => {
    it('should call authService.logout with session token and session info', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-session-token',
        },
      } as Request;

      authService.logout.mockResolvedValue();

      await controller.logout(mockSessionInfo, mockRequest);

      expect(authService.logout).toHaveBeenCalledWith('valid-session-token', mockSessionInfo);
    });

    it('should extract session token from Bearer authorization header', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer abc123def456',
        },
      } as Request;

      authService.logout.mockResolvedValue();

      await controller.logout(mockSessionInfo, mockRequest);

      expect(authService.logout).toHaveBeenCalledWith('abc123def456', mockSessionInfo);
    });

    it('should not call authService.logout when no authorization header present', async () => {
      const mockRequest = {
        headers: {},
      } as Request;

      await controller.logout(mockSessionInfo, mockRequest);

      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should not call authService.logout when authorization header is malformed', async () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat',
        },
      } as Request;

      await controller.logout(mockSessionInfo, mockRequest);

      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should call authService.logout even when authorization header does not start with Bearer', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Basic abc123',
        },
      } as Request;

      await controller.logout(mockSessionInfo, mockRequest);

      // Controller splits on space and uses the second part regardless of scheme
      expect(authService.logout).toHaveBeenCalledWith('abc123', mockSessionInfo);
    });

    it('should propagate errors from authService.logout', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      } as Request;
      const error = new Error('Logout failed');

      authService.logout.mockRejectedValue(error);

      await expect(controller.logout(mockSessionInfo, mockRequest)).rejects.toThrow('Logout failed');
    });
  });
});
