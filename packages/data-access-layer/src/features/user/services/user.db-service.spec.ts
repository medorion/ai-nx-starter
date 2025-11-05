import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository, ObjectId } from 'typeorm';
import { UserDbService } from './user.db-service';
import { User } from '../entities/user.entity';
import { Role } from '@ai-nx-starter/types';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('UserDbService', () => {
  let service: UserDbService;
  let repository: jest.Mocked<MongoRepository<User>>;

  const mockUser: User = {
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    role: Role.User,
    phone: '+1234567890',
    picture: 'https://example.com/pic.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDbService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserDbService>(UserDbService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { _id: expect.any(ObjectId) },
      });
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });

    it('should return null when invalid ObjectId', async () => {
      const result = await service.findById('invalid-id');

      expect(result).toBeNull();
      expect(repository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of users with default pagination', async () => {
      const users = [mockUser];
      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(repository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        order: { createdAt: 'DESC' },
      });
    });

    it('should return array of users with custom pagination', async () => {
      const users = [mockUser];
      repository.find.mockResolvedValue(users);

      const result = await service.findAll(10, 20);

      expect(result).toEqual(users);
      expect(repository.find).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('should return total count of users', async () => {
      repository.count.mockResolvedValue(42);

      const result = await service.count();

      expect(result).toBe(42);
      expect(repository.count).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const createData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'plainPassword',
        role: Role.User,
        phone: '+1234567890',
        picture: '',
      };

      const createdUser = { ...mockUser, ...createData, id: mockUser.id };
      repository.create.mockReturnValue(createdUser as any);
      repository.save.mockResolvedValue(createdUser as any);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(createData);

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...createData,
        password: 'hashedPassword',
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should update user and return updated entity', async () => {
      const updateData = { firstName: 'Updated' };
      const updatedUser = { ...mockUser, ...updateData, id: mockUser.id };

      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      repository.findOne.mockResolvedValue(updatedUser as any);

      const result = await service.update('507f1f77bcf86cd799439011', updateData);

      expect(repository.update).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        expect.objectContaining({ ...updateData, updatedAt: expect.any(Date) }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should hash password when updating password', async () => {
      const updateData = { password: 'newPassword' };

      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      repository.findOne.mockResolvedValue(mockUser);

      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      await service.update('507f1f77bcf86cd799439011', updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(repository.update).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        expect.objectContaining({ password: 'newHashedPassword' }),
      );
    });

    it('should return null when user not found', async () => {
      repository.update.mockResolvedValue({ affected: 0, raw: {}, generatedMaps: [] });

      const result = await service.update('507f1f77bcf86cd799439011', { firstName: 'Test' });

      expect(result).toBeNull();
    });

    it('should return null when invalid ObjectId', async () => {
      const result = await service.update('invalid-id', { firstName: 'Test' });

      expect(result).toBeNull();
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete user and return true', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.delete('507f1f77bcf86cd799439011');

      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return false when user not found', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      const result = await service.delete('507f1f77bcf86cd799439011');

      expect(result).toBe(false);
    });

    it('should return false when invalid ObjectId', async () => {
      const result = await service.delete('invalid-id');

      expect(result).toBe(false);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should return user with password field', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmailWithPassword('john@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        select: expect.arrayContaining(['password']),
      });
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password matches', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword('plainPassword', 'hashedPassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
    });

    it('should return false when password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyPassword('wrongPassword', 'hashedPassword');

      expect(result).toBe(false);
    });
  });
});
