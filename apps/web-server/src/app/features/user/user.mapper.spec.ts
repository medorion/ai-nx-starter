import { UserMapper } from './user.mapper';
import { User } from '@ai-nx-starter/data-access-layer';
import { Role } from '@ai-nx-starter/types';
import { ObjectId } from 'typeorm';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  const mockUser: User = {
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: Role.User,
    phone: '+1234567890',
    picture: 'https://example.com/pic.jpg',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  describe('toDto', () => {
    it('should convert User entity to ClientUserDto', () => {
      const result = mapper.toDto(mockUser);

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: Role.User,
        phone: '+1234567890',
        picture: 'https://example.com/pic.jpg',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should not include password in DTO', () => {
      const result = mapper.toDto(mockUser);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('_id');
    });

    it('should handle null/undefined picture', () => {
      const userWithoutPicture = { ...mockUser, picture: '' };
      const result = mapper.toDto(userWithoutPicture);

      expect(result.picture).toBe('');
    });

    it('should handle all roles correctly', () => {
      const adminUser = { ...mockUser, role: Role.Admin };
      const result = mapper.toDto(adminUser);

      expect(result.role).toBe(Role.Admin);
    });
  });

  describe('toDtoArray', () => {
    it('should convert array of User entities to ClientUserDto array', () => {
      const users: User[] = [
        mockUser,
        {
          ...mockUser,
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          id: '507f1f77bcf86cd799439012',
          firstName: 'Jane',
          email: 'jane@example.com',
        },
      ];

      const result = mapper.toDtoArray(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
      expect(result[0].firstName).toBe('John');
      expect(result[1].id).toBe('507f1f77bcf86cd799439012');
      expect(result[1].firstName).toBe('Jane');
    });

    it('should return empty array when given empty array', () => {
      const result = mapper.toDtoArray([]);

      expect(result).toEqual([]);
    });

    it('should not include password in any DTO in array', () => {
      const users: User[] = [mockUser];
      const result = mapper.toDtoArray(users);

      result.forEach((dto) => {
        expect(dto).not.toHaveProperty('password');
        expect(dto).not.toHaveProperty('_id');
      });
    });
  });
});
