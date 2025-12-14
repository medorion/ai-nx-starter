import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsersService } from './users.service';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto, CreateUserDto, UpdateUserDto, Role } from '@ai-nx-starter/types';

describe('UsersService', () => {
  let service: UsersService;
  let apiUserService: jest.Mocked<ApiUserService>;

  const mockUser: ClientUserDto = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    phone: '+1234567890',
    role: Role.Admin,
    picture: 'https://example.com/picture.jpg',
    createdAt: new Date('2025-01-01'),
  };

  const mockUser2: ClientUserDto = {
    id: 'user-456',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'user2@example.com',
    phone: '+0987654321',
    role: Role.User,
    picture: '',
    createdAt: new Date('2025-01-02'),
  };

  beforeEach(() => {
    const mockApiUserService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      getCount: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [UsersService, { provide: ApiUserService, useValue: mockApiUserService }],
    });

    service = TestBed.inject(UsersService);
    apiUserService = TestBed.inject(ApiUserService) as jest.Mocked<ApiUserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('should initialize with loading state false', (done) => {
      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });
  });

  describe('getUsers', () => {
    it('should get all users without parameters', (done) => {
      const users = [mockUser, mockUser2];
      apiUserService.findAll.mockReturnValue(of(users));

      service.getUsers().subscribe((result) => {
        expect(result).toEqual(users);
        expect(apiUserService.findAll).toHaveBeenCalledWith(undefined, undefined);
        done();
      });
    });

    it('should get users with limit parameter', (done) => {
      const users = [mockUser];
      apiUserService.findAll.mockReturnValue(of(users));

      service.getUsers(10).subscribe((result) => {
        expect(result).toEqual(users);
        expect(apiUserService.findAll).toHaveBeenCalledWith(10, undefined);
        done();
      });
    });

    it('should get users with limit and offset parameters', (done) => {
      const users = [mockUser2];
      apiUserService.findAll.mockReturnValue(of(users));

      service.getUsers(5, 20).subscribe((result) => {
        expect(result).toEqual(users);
        expect(apiUserService.findAll).toHaveBeenCalledWith(5, 20);
        done();
      });
    });

    it('should set loading to true before request and false after', (done) => {
      const users = [mockUser];
      apiUserService.findAll.mockReturnValue(of(users));

      const loadingStates: boolean[] = [];

      service.loading$.subscribe((loading) => {
        loadingStates.push(loading);
      });

      service.getUsers().subscribe(() => {
        // Wait for finalize to execute
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });

    it('should return empty array when no users found', (done) => {
      apiUserService.findAll.mockReturnValue(of([]));

      service.getUsers().subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', (done) => {
      apiUserService.findById.mockReturnValue(of(mockUser));

      service.getUserById('user-123').subscribe((result) => {
        expect(result).toEqual(mockUser);
        expect(apiUserService.findById).toHaveBeenCalledWith('user-123');
        done();
      });
    });

    it('should set loading to true before request and false after', (done) => {
      apiUserService.findById.mockReturnValue(of(mockUser));

      const loadingStates: boolean[] = [];

      service.loading$.subscribe((loading) => {
        loadingStates.push(loading);
      });

      service.getUserById('user-123').subscribe(() => {
        // Wait for finalize to execute
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', (done) => {
      apiUserService.findByEmail.mockReturnValue(of(mockUser));

      service.getUserByEmail('test@example.com').subscribe((result) => {
        expect(result).toEqual(mockUser);
        expect(apiUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
        done();
      });
    });

    it('should set loading to true before request and false after', (done) => {
      apiUserService.findByEmail.mockReturnValue(of(mockUser));

      const loadingStates: boolean[] = [];

      service.loading$.subscribe((loading) => {
        loadingStates.push(loading);
      });

      service.getUserByEmail('test@example.com').subscribe(() => {
        // Wait for finalize to execute
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });

    it('should handle email with special characters', (done) => {
      const specialEmail = 'user+test@example.co.uk';
      apiUserService.findByEmail.mockReturnValue(of(mockUser));

      service.getUserByEmail(specialEmail).subscribe((result) => {
        expect(result).toEqual(mockUser);
        expect(apiUserService.findByEmail).toHaveBeenCalledWith(specialEmail);
        done();
      });
    });
  });

  describe('getCount', () => {
    it('should get count of users', (done) => {
      const countResponse = { count: 42 };
      apiUserService.getCount.mockReturnValue(of(countResponse));

      service.getCount().subscribe((result) => {
        expect(result).toEqual(countResponse);
        expect(apiUserService.getCount).toHaveBeenCalled();
        done();
      });
    });

    it('should return zero count when no users exist', (done) => {
      apiUserService.getCount.mockReturnValue(of({ count: 0 }));

      service.getCount().subscribe((result) => {
        expect(result.count).toBe(0);
        done();
      });
    });

    it('should not set loading state for getCount', (done) => {
      apiUserService.getCount.mockReturnValue(of({ count: 10 }));

      const loadingStates: boolean[] = [];
      service.loading$.subscribe((loading) => loadingStates.push(loading));

      service.getCount().subscribe(() => {
        expect(loadingStates.filter((state) => state === true)).toHaveLength(0);
        done();
      });
    });
  });

  describe('createUser', () => {
    it('should create new user', (done) => {
      const createDto: CreateUserDto = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        phone: '+1111111111',
        role: Role.User,
        password: 'SecurePass123!',
      };

      const createdUser: ClientUserDto = {
        id: 'new-user-id',
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        email: createDto.email,
        phone: createDto.phone,
        role: createDto.role,
        picture: '',
        createdAt: new Date(),
      };

      apiUserService.create.mockReturnValue(of(createdUser));

      service.createUser(createDto).subscribe((result) => {
        expect(result).toEqual(createdUser);
        expect(apiUserService.create).toHaveBeenCalledWith(createDto);
        done();
      });
    });

    it('should set loading to true before request and false after', (done) => {
      const createDto: CreateUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+1234567890',
        role: Role.Admin,
        password: 'password',
      };

      apiUserService.create.mockReturnValue(of(mockUser));

      const loadingStates: boolean[] = [];

      service.loading$.subscribe((loading) => {
        loadingStates.push(loading);
      });

      service.createUser(createDto).subscribe(() => {
        // Wait for finalize to execute
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });

    it('should create user with optional picture field', (done) => {
      const createDto: CreateUserDto = {
        firstName: 'Picture',
        lastName: 'User',
        email: 'user@example.com',
        phone: '+1234567890',
        role: Role.User,
        password: 'pass123',
        picture: 'https://example.com/photo.jpg',
      };

      const createdUser: ClientUserDto = {
        ...mockUser,
        picture: createDto.picture!,
      };

      apiUserService.create.mockReturnValue(of(createdUser));

      service.createUser(createDto).subscribe((result) => {
        expect(result.picture).toBe(createDto.picture);
        done();
      });
    });
  });

  describe('updateUser', () => {
    it('should update existing user', (done) => {
      const updateDto: UpdateUserDto = {
        email: 'updated@example.com',
        phone: '+9999999999',
      };

      const updatedUser: ClientUserDto = {
        ...mockUser,
        ...updateDto,
      };

      apiUserService.update.mockReturnValue(of(updatedUser));

      service.updateUser('user-123', updateDto).subscribe((result) => {
        expect(result).toEqual(updatedUser);
        expect(apiUserService.update).toHaveBeenCalledWith('user-123', updateDto);
        done();
      });
    });

    it('should set loading to true before request and false after', (done) => {
      const updateDto: UpdateUserDto = {
        email: 'updated@example.com',
      };

      apiUserService.update.mockReturnValue(of(mockUser));

      const loadingStates: boolean[] = [];

      service.loading$.subscribe((loading) => {
        loadingStates.push(loading);
      });

      service.updateUser('user-123', updateDto).subscribe(() => {
        // Wait for finalize to execute
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });

    it('should update only specified fields', (done) => {
      const updateDto: UpdateUserDto = {
        phone: '+5555555555',
      };

      const updatedUser: ClientUserDto = {
        ...mockUser,
        phone: updateDto.phone!,
      };

      apiUserService.update.mockReturnValue(of(updatedUser));

      service.updateUser('user-123', updateDto).subscribe((result) => {
        expect(result.phone).toBe(updateDto.phone);
        expect(result.email).toBe(mockUser.email);
        done();
      });
    });

    it('should allow updating role', (done) => {
      const updateDto: UpdateUserDto = {
        role: Role.Root,
      };

      const updatedUser: ClientUserDto = {
        ...mockUser,
        role: Role.Root,
      };

      apiUserService.update.mockReturnValue(of(updatedUser));

      service.updateUser('user-123', updateDto).subscribe((result) => {
        expect(result.role).toBe(Role.Root);
        done();
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user by ID', (done) => {
      apiUserService.delete.mockReturnValue(of(undefined));

      service.deleteUser('user-123').subscribe((result) => {
        expect(result).toBeUndefined();
        expect(apiUserService.delete).toHaveBeenCalledWith('user-123');
        done();
      });
    });

    it('should set loading to true before request and false after', (done) => {
      apiUserService.delete.mockReturnValue(of(undefined));

      const loadingStates: boolean[] = [];

      service.loading$.subscribe((loading) => {
        loadingStates.push(loading);
      });

      service.deleteUser('user-123').subscribe(() => {
        // Wait for finalize to execute
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });
  });
});
