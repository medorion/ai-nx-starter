import { Test, TestingModule } from '@nestjs/testing';
import { TeamMapper } from './team.mapper';
import { UserDbService } from '@ai-nx-starter/data-access-layer';
import { UserMapper } from '../user/user.mapper';
import { Team, User } from '@ai-nx-starter/data-access-layer';
import { ClientUserDto, Role } from '@ai-nx-starter/types';
import { ObjectId } from 'typeorm';

describe('TeamMapper', () => {
  let mapper: TeamMapper;
  let userDbService: jest.Mocked<UserDbService>;
  let userMapper: jest.Mocked<UserMapper>;

  const mockUser: User = {
    _id: new ObjectId('507f1f77bcf86cd799439012'),
    id: '507f1f77bcf86cd799439012',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: Role.User,
    phone: '',
    picture: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUserDto: ClientUserDto = {
    id: '507f1f77bcf86cd799439012',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: Role.User,
    phone: '',
    picture: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTeam: Team = {
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    id: '507f1f77bcf86cd799439011',
    name: 'Engineering Team',
    description: 'Our amazing team',
    ownerId: new ObjectId('507f1f77bcf86cd799439012'),
    memberIds: [new ObjectId('507f1f77bcf86cd799439012'), new ObjectId('507f1f77bcf86cd799439013')],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockUserDbService = {
      findById: jest.fn(),
    };

    const mockUserMapper = {
      toDto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamMapper, { provide: UserDbService, useValue: mockUserDbService }, { provide: UserMapper, useValue: mockUserMapper }],
    }).compile();

    mapper = module.get<TeamMapper>(TeamMapper);
    userDbService = module.get(UserDbService);
    userMapper = module.get(UserMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toDto', () => {
    it('should convert Team entity to ClientTeamDto without relations', () => {
      const result = mapper.toDto(mockTeam);

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Engineering Team',
        description: 'Our amazing team',
        ownerId: '507f1f77bcf86cd799439012',
        memberIds: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
        createdAt: mockTeam.createdAt,
        updatedAt: mockTeam.updatedAt,
      });
    });
  });

  describe('toDtoWithRelations', () => {
    it('should convert Team entity to ClientTeamDto with populated owner and members', async () => {
      const mockMember2: User = {
        ...mockUser,
        _id: new ObjectId('507f1f77bcf86cd799439013'),
        id: '507f1f77bcf86cd799439013',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      };

      const mockMember2Dto: ClientUserDto = {
        ...mockUserDto,
        id: '507f1f77bcf86cd799439013',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      };

      userDbService.findById.mockImplementation((id: string) => {
        if (id === '507f1f77bcf86cd799439012') {
          return Promise.resolve(mockUser);
        } else if (id === '507f1f77bcf86cd799439013') {
          return Promise.resolve(mockMember2);
        }
        return Promise.resolve(null);
      });

      userMapper.toDto.mockImplementation((user: User) => {
        if (user.id === '507f1f77bcf86cd799439012') {
          return mockUserDto;
        } else if (user.id === '507f1f77bcf86cd799439013') {
          return mockMember2Dto;
        }
        return mockUserDto;
      });

      const result = await mapper.toDtoWithRelations(mockTeam);

      expect(result.id).toBe('507f1f77bcf86cd799439011');
      expect(result.name).toBe('Engineering Team');
      expect(result.owner).toEqual(mockUserDto);
      expect(result.members).toHaveLength(2);
      expect(result.members).toContainEqual(mockUserDto);
      expect(result.members).toContainEqual(mockMember2Dto);
    });

    it('should handle missing owner gracefully', async () => {
      userDbService.findById.mockResolvedValue(null);
      userMapper.toDto.mockReturnValue(mockUserDto);

      const result = await mapper.toDtoWithRelations(mockTeam);

      expect(result.owner).toBeUndefined();
      expect(result.members).toEqual([]);
    });

    it('should handle missing members gracefully', async () => {
      userDbService.findById.mockImplementation((id: string) => {
        if (id === '507f1f77bcf86cd799439012') {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      });

      userMapper.toDto.mockReturnValue(mockUserDto);

      const result = await mapper.toDtoWithRelations(mockTeam);

      expect(result.owner).toEqual(mockUserDto);
      expect(result.members).toHaveLength(1);
      expect(result.members).toContainEqual(mockUserDto);
    });
  });

  describe('toDtoArray', () => {
    it('should convert array of Team entities to array of DTOs', () => {
      const teams = [mockTeam];

      const result = mapper.toDtoArray(teams);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Engineering Team',
        description: 'Our amazing team',
        ownerId: '507f1f77bcf86cd799439012',
        memberIds: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
        createdAt: mockTeam.createdAt,
        updatedAt: mockTeam.updatedAt,
      });
    });
  });

  describe('toDtoArrayWithRelations', () => {
    it('should convert array of Team entities to array of DTOs with relations', async () => {
      const teams = [mockTeam];

      userDbService.findById.mockResolvedValue(mockUser);
      userMapper.toDto.mockReturnValue(mockUserDto);

      const result = await mapper.toDtoArrayWithRelations(teams);

      expect(result).toHaveLength(1);
      expect(result[0].owner).toEqual(mockUserDto);
      expect(result[0].members).toBeDefined();
    });
  });
});
