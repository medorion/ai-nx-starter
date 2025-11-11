import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { SessionService } from './session.service';
import { SessionInfo } from '../interfaces/session-info.interface';
import { Role } from '@ai-nx-starter/types';

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    multi: jest.fn().mockReturnValue({
      ttl: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
    mget: jest.fn().mockResolvedValue([]),
    ping: jest.fn().mockResolvedValue('PONG'),
  }));
});

describe('SessionService', () => {
  let service: SessionService;
  let mockRedisClient: any;
  let logger: jest.Mocked<PinoLogger>;

  const mockSessionInfo: SessionInfo = {
    userId: 'user-123',
    email: 'test@example.com',
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
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          REDIS_HOST: 'localhost',
          REDIS_PORT: '6379',
          REDIS_PASSWORD: undefined,
          TIME_BEFORE_SESSION_EXPIRE_MS: 2101350,
        };
        return config[key];
      }),
    };

    const mockLogger = {
      setContext: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService, { provide: ConfigService, useValue: mockConfigService }, { provide: PinoLogger, useValue: mockLogger }],
    }).compile();

    service = module.get<SessionService>(SessionService);
    logger = module.get(PinoLogger);

    // Get the mocked Redis client instance
    mockRedisClient = (service as any).client;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSessionWithToken', () => {
    it('should create session with provided token and default TTL', async () => {
      const token = 'test-token-123';
      const userIp = '192.168.1.1';

      const result = await service.createSessionWithToken(mockSessionInfo, userIp, token);

      expect(result).toBe(token);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        token,
        JSON.stringify({
          userIp,
          sessionInfo: mockSessionInfo,
          id: mockSessionInfo.userId,
        }),
        'EX',
        2101350,
      );
    });

    it('should create session with custom TTL', async () => {
      const token = 'test-token-456';
      const userIp = '10.0.0.1';
      const customTTL = 3600;

      const result = await service.createSessionWithToken(mockSessionInfo, userIp, token, customTTL);

      expect(result).toBe(token);
      expect(mockRedisClient.set).toHaveBeenCalledWith(token, expect.any(String), 'EX', customTTL);
    });

    it('should store complete session data including userIp', async () => {
      const token = 'test-token-789';
      const userIp = '172.16.0.1';

      await service.createSessionWithToken(mockSessionInfo, userIp, token);

      const storedData = JSON.parse(mockRedisClient.set.mock.calls[0][1]);
      expect(storedData).toEqual({
        userIp,
        sessionInfo: mockSessionInfo,
        id: mockSessionInfo.userId,
      });
    });
  });

  describe('getSession', () => {
    it('should return session info when session exists', async () => {
      const token = 'valid-token';
      const sessionData = {
        userIp: '192.168.1.1',
        sessionInfo: mockSessionInfo,
        id: mockSessionInfo.userId,
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(sessionData));

      const result = await service.getSession(token);

      expect(result).toEqual(mockSessionInfo);
      expect(mockRedisClient.get).toHaveBeenCalledWith(token);
    });

    it('should return null when session does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.getSession('nonexistent-token');

      expect(result).toBeNull();
    });

    it('should return null when Redis returns empty string', async () => {
      mockRedisClient.get.mockResolvedValue('');

      const result = await service.getSession('token');

      expect(result).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update existing session', async () => {
      const token = 'valid-token';
      const existingData = {
        userIp: '192.168.1.1',
        sessionInfo: mockSessionInfo,
        id: mockSessionInfo.userId,
      };
      const updatedSessionInfo = {
        ...mockSessionInfo,
        email: 'updated@example.com',
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(existingData));

      await service.updateSession(token, updatedSessionInfo);

      expect(mockRedisClient.get).toHaveBeenCalledWith(token);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        token,
        JSON.stringify({
          ...existingData,
          sessionInfo: updatedSessionInfo,
        }),
        'EX',
        2101350,
      );
    });

    it('should throw UnauthorizedLoginException when session does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      await expect(service.updateSession('nonexistent-token', mockSessionInfo)).rejects.toThrow('Admin login failed, missing token!');

      expect(mockRedisClient.set).not.toHaveBeenCalled();
    });
  });

  describe('killSessionByToken', () => {
    it('should delete session successfully', async () => {
      const token = 'token-to-delete';
      mockRedisClient.del.mockResolvedValue(1);

      await service.killSessionByToken(token);

      expect(mockRedisClient.del).toHaveBeenCalledWith(token);
    });

    it('should handle Redis errors gracefully', async () => {
      const token = 'problematic-token';
      const error = new Error('Redis connection error');
      mockRedisClient.del.mockRejectedValue(error);

      await service.killSessionByToken(token);

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Redis connection error'));
    });
  });

  describe('getAllSessions', () => {
    it('should return active sessions within time window', async () => {
      const activeForSec = 300; // 5 minutes
      const keys = ['token1', 'token2', 'token3'];
      const ttls = [
        [null, 2100000], // Very fresh session (just created)
        [null, 2000000], // Active within 5 minutes
        [null, 1000000], // Too old
      ];

      const sessionRecords = [
        JSON.stringify({
          userIp: '192.168.1.1',
          sessionInfo: mockSessionInfo,
          id: 'user-1',
        }),
        JSON.stringify({
          userIp: '192.168.1.2',
          sessionInfo: { ...mockSessionInfo, userId: 'user-2' },
          id: 'user-2',
        }),
      ];

      mockRedisClient.keys.mockResolvedValue(keys);
      const mockMulti = {
        ttl: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(ttls),
      };
      mockRedisClient.multi.mockReturnValue(mockMulti);
      mockRedisClient.mget.mockResolvedValue(sessionRecords);

      const result = await service.getAllSessions(activeForSec);

      expect(result).toHaveLength(2);
      expect(mockRedisClient.keys).toHaveBeenCalledWith('*');
    });

    it('should return empty array when no sessions exist', async () => {
      mockRedisClient.keys.mockResolvedValue([]);
      const mockMulti = {
        ttl: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      mockRedisClient.multi.mockReturnValue(mockMulti);
      mockRedisClient.mget.mockResolvedValue([]);

      const result = await service.getAllSessions(300);

      expect(result).toEqual([]);
      // mget is called with empty array of keys
      expect(mockRedisClient.mget).toHaveBeenCalledWith([]);
    });
  });

  describe('createToken (static)', () => {
    it('should generate token of length 55 + timestamp length + 1', () => {
      const token = SessionService.createToken();

      // Format: 55 random chars + 'Z' + timestamp in base36
      expect(token).toMatch(/^[A-Za-z0-9]{55}Z[a-z0-9]+$/);
      expect(token.length).toBeGreaterThan(55);
    });

    it('should generate unique tokens on multiple calls', () => {
      const token1 = SessionService.createToken();
      const token2 = SessionService.createToken();
      const token3 = SessionService.createToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });

    it('should include timestamp marker "Z" in token', () => {
      const token = SessionService.createToken();

      expect(token).toContain('Z');
      expect(token.indexOf('Z')).toBe(55); // After 55 random characters
    });
  });

  describe('ping', () => {
    it('should return true when Redis responds with PONG', async () => {
      mockRedisClient.ping.mockResolvedValue('PONG');

      const result = await service.ping();

      expect(result).toBe(true);
      expect(mockRedisClient.ping).toHaveBeenCalled();
    });

    it('should return false when Redis does not respond with PONG', async () => {
      mockRedisClient.ping.mockResolvedValue('FAIL');

      const result = await service.ping();

      expect(result).toBe(false);
    });
  });
});
