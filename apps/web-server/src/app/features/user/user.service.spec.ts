import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDbService } from '@ai-nx-starter/data-access-layer';
import { UserMapper } from './user.mapper';
import { ClientUserDto, CreateUserDto, UpdateUserDto, Role } from '@ai-nx-starter/types';
import { User } from '@ai-nx-starter/data-access-layer';
import { ObjectId } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let dbService: jest.Mocked<UserDbService>;
  let mapper: jest.Mocked<UserMapper>;

  const mockUser: User = {
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: Role.User,
    phone: '+1234567890',
    picture: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockDto: ClientUserDto = {
    id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: Role.User,
    phone: '+1234567890',
    picture: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockDbService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockMapper = {
      toDto: jest.fn(),
      toDtoArray: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: UserDbService, useValue: mockDbService }, { provide: UserMapper, useValue: mockMapper }],
    }).compile();

    service = module.get<UserService>(UserService);
    dbService = module.get(UserDbService);
    mapper = module.get(UserMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of user DTOs with default pagination', async () => {
      const users = [mockUser];
      const dtos = [mockDto];

      dbService.findAll.mockResolvedValue(users);
      mapper.toDtoArray.mockReturnValue(dtos);

      const result = await service.findAll();

      expect(result).toEqual(dtos);
      expect(dbService.findAll).toHaveBeenCalledWith(50, 0);
      expect(mapper.toDtoArray).toHaveBeenCalledWith(users);
    });

    it('should return array of user DTOs with custom pagination', async () => {
      const users = [mockUser];
      const dtos = [mockDto];

      dbService.findAll.mockResolvedValue(users);
      mapper.toDtoArray.mockReturnValue(dtos);

      const result = await service.findAll(10, 20);

      expect(result).toEqual(dtos);
      expect(dbService.findAll).toHaveBeenCalledWith(10, 20);
    });
  });

  describe('findById', () => {
    it('should return user DTO when found', async () => {
      dbService.findById.mockResolvedValue(mockUser);
      mapper.toDto.mockReturnValue(mockDto);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockDto);
      expect(dbService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mapper.toDto).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      dbService.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(new NotFoundException('User with ID nonexistent-id not found'));
    });
  });

  describe('findByEmail', () => {
    it('should return user DTO when found', async () => {
      dbService.findByEmail.mockResolvedValue(mockUser);
      mapper.toDto.mockReturnValue(mockDto);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockDto);
      expect(dbService.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mapper.toDto).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      dbService.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        new NotFoundException('User with email nonexistent@example.com not found'),
      );
    });
  });

  describe('count', () => {
    it('should return total count of users', async () => {
      dbService.count.mockResolvedValue(42);

      const result = await service.count();

      expect(result).toBe(42);
      expect(dbService.count).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: Role.User,
      phone: '+1234567890',
      picture: '',
    };

    it('should create user successfully', async () => {
      dbService.findByEmail.mockResolvedValue(null);
      dbService.create.mockResolvedValue(mockUser);
      mapper.toDto.mockReturnValue(mockDto);

      const result = await service.create(createDto);

      expect(result).toEqual(mockDto);
      expect(dbService.findByEmail).toHaveBeenCalledWith(createDto.email);
      expect(dbService.create).toHaveBeenCalledWith(createDto);
      expect(mapper.toDto).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      dbService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(new ConflictException('User with email jane@example.com already exists'));

      expect(dbService.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateDto, id: mockUser.id };

      dbService.findById.mockResolvedValue(mockUser);
      dbService.update.mockResolvedValue(updatedUser as User);
      mapper.toDto.mockReturnValue({ ...mockDto, ...updateDto });

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual({ ...mockDto, ...updateDto });
      expect(dbService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(dbService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      dbService.findById.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(
        new NotFoundException('User with ID nonexistent-id not found'),
      );

      expect(dbService.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when updating to existing email', async () => {
      const updateWithEmail: UpdateUserDto = { email: 'existing@example.com' };
      const otherUser = { ...mockUser, id: 'other-id', email: 'existing@example.com', _id: new ObjectId('507f1f77bcf86cd799439012') };

      dbService.findById.mockResolvedValue(mockUser);
      dbService.findByEmail.mockResolvedValue(otherUser as User);

      await expect(service.update('507f1f77bcf86cd799439011', updateWithEmail)).rejects.toThrow(
        new ConflictException('User with email existing@example.com already exists'),
      );

      expect(dbService.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same email', async () => {
      const updateWithSameEmail: UpdateUserDto = { email: 'john@example.com' };

      dbService.findById.mockResolvedValue(mockUser);
      dbService.findByEmail.mockResolvedValue(mockUser);
      dbService.update.mockResolvedValue(mockUser);
      mapper.toDto.mockReturnValue(mockDto);

      const result = await service.update('507f1f77bcf86cd799439011', updateWithSameEmail);

      expect(result).toEqual(mockDto);
      expect(dbService.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when update fails', async () => {
      dbService.findById.mockResolvedValue(mockUser);
      dbService.update.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', updateDto)).rejects.toThrow(
        new NotFoundException('Failed to update user with ID 507f1f77bcf86cd799439011'),
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      dbService.findById.mockResolvedValue(mockUser);
      dbService.delete.mockResolvedValue(true);

      await service.delete('507f1f77bcf86cd799439011');

      expect(dbService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(dbService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when user not found', async () => {
      dbService.findById.mockResolvedValue(null);

      await expect(service.delete('nonexistent-id')).rejects.toThrow(new NotFoundException('User with ID nonexistent-id not found'));

      expect(dbService.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete fails', async () => {
      dbService.findById.mockResolvedValue(mockUser);
      dbService.delete.mockResolvedValue(false);

      await expect(service.delete('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('Failed to delete user with ID 507f1f77bcf86cd799439011'),
      );
    });
  });
});
