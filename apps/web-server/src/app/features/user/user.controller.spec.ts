import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ClientUserDto, CreateUserDto, UpdateUserDto, Role } from '@ai-nx-starter/types';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

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
    const mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of users with default pagination', async () => {
      const users = [mockDto];
      service.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should return array of users with custom pagination', async () => {
      const users = [mockDto];
      service.findAll.mockResolvedValue(users);

      const result = await controller.findAll(10, 20);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(10, 20);
    });
  });

  describe('getCount', () => {
    it('should return count of users', async () => {
      service.count.mockResolvedValue(42);

      const result = await controller.getCount();

      expect(result).toEqual({ count: 42 });
      expect(service.count).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      service.findByEmail.mockResolvedValue(mockDto);

      const result = await controller.findByEmail('john@example.com');

      expect(result).toEqual(mockDto);
      expect(service.findByEmail).toHaveBeenCalledWith('john@example.com');
    });
  });

  describe('findById', () => {
    it('should return user by ID', async () => {
      service.findById.mockResolvedValue(mockDto);

      const result = await controller.findById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockDto);
      expect(service.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('create', () => {
    it('should create and return new user', async () => {
      const createDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: Role.User,
        phone: '+1234567890',
        picture: '',
      };

      service.create.mockResolvedValue(mockDto);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedDto = { ...mockDto, ...updateDto };
      service.update.mockResolvedValue(updatedDto);

      const result = await controller.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedDto);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('507f1f77bcf86cd799439011');

      expect(service.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
