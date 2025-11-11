import { AuthMapperService } from './auth-mapper.service';
import { SessionInfo } from '@ai-nx-starter/backend-common';
import { ClientUserDto, Role } from '@ai-nx-starter/types';

describe('AuthMapperService', () => {
  let service: AuthMapperService;

  beforeEach(() => {
    service = new AuthMapperService();
  });

  describe('mapSessionInfoToClientUserDto', () => {
    it('should map SessionInfo to ClientUserDto with all fields', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        role: Role.Admin,
        picture: 'https://example.com/avatar.jpg',
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'fingerprint-123',
        clientId: 'client-123',
      };

      const result: ClientUserDto = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result).toEqual({
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.Admin,
        email: 'john.doe@example.com',
        phone: '+1234567890',
        picture: 'https://example.com/avatar.jpg',
      });
    });

    it('should extract firstName from email prefix (before @ symbol)', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'alice@example.com',
        phone: '+1234567890',
        role: Role.User,
        picture: '',
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'fingerprint-123',
        clientId: 'client-123',
      };

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result.firstName).toBe('Alice');
      expect(result.lastName).toBe('');
    });

    it('should extract firstName and lastName from email format firstname.lastname@domain', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'jane.smith@example.com',
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

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
    });

    it('should capitalize first letter of firstName and lastName', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'bob.wilson@example.com',
        phone: '+1234567890',
        role: Role.Root,
        picture: '',
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'fingerprint-123',
        clientId: 'client-123',
      };

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result.firstName).toBe('Bob');
      expect(result.lastName).toBe('Wilson');
    });

    it('should handle uppercase email by converting to proper case', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'MICHAEL.JOHNSON@EXAMPLE.COM',
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

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result.firstName).toBe('Michael');
      expect(result.lastName).toBe('Johnson');
    });

    it('should handle email with multiple dots by using first two parts', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'mary.ann.lee@example.com',
        phone: '+1234567890',
        role: Role.User,
        picture: '',
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'fingerprint-123',
        clientId: 'client-123',
      };

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result.firstName).toBe('Mary');
      expect(result.lastName).toBe('Ann');
    });

    it('should handle empty email by returning empty firstName and lastName', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: '',
        phone: '+1234567890',
        role: Role.User,
        picture: '',
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'fingerprint-123',
        clientId: 'client-123',
      };

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
    });

    it('should handle email without @ symbol gracefully', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'invalidemailformat',
        phone: '+1234567890',
        role: Role.User,
        picture: '',
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'fingerprint-123',
        clientId: 'client-123',
      };

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      // Should use the whole string as firstName when no @ present
      expect(result.firstName).toBe('Invalidemailformat');
      expect(result.lastName).toBe('');
    });

    it('should not include sensitive session data in DTO', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        role: Role.Admin,
        picture: '',
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'sensitive-fingerprint',
        clientId: 'sensitive-client-id',
      };

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      // Ensure sensitive fields are NOT included
      expect(result).not.toHaveProperty('fingerprint');
      expect(result).not.toHaveProperty('clientId');
      expect(result).not.toHaveProperty('expiresAt');
      expect(result).not.toHaveProperty('serverVersion');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('creationDate');
    });

    it('should map all allowed fields correctly', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-456',
        email: 'test.user@example.com',
        phone: '+9876543210',
        role: Role.Root,
        picture: 'http://cdn.example.com/pic.png',
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'fingerprint-456',
        clientId: 'client-456',
      };

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result.id).toBe('user-456');
      expect(result.email).toBe('test.user@example.com');
      expect(result.phone).toBe('+9876543210');
      expect(result.role).toBe(Role.Root);
      expect(result.picture).toBe('http://cdn.example.com/pic.png');
    });

    it('should handle undefined phone gracefully', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'test@example.com',
        phone: undefined as any,
        role: Role.User,
        picture: '',
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'fingerprint-123',
        clientId: 'client-123',
      };

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result.phone).toBeUndefined();
    });

    it('should handle undefined picture gracefully', () => {
      const sessionInfo: SessionInfo = {
        userId: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        role: Role.User,
        picture: undefined as any,
        createdAt: Date.now(),
        creationDate: Date.now(),
        expiresAt: Date.now() + 3600000,
        serverVersion: '1.0.0',
        fingerprint: 'fingerprint-123',
        clientId: 'client-123',
      };

      const result = service.mapSessionInfoToClientUserDto(sessionInfo);

      expect(result.picture).toBeUndefined();
    });
  });
});
