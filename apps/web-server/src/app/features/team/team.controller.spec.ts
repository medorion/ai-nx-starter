import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { ClientTeamDto, CreateTeamDto, UpdateTeamDto, AddMemberDto, Role } from '@ai-nx-starter/types';
import { SessionInfo } from '@ai-nx-starter/backend-common';

describe('TeamController', () => {
  let controller: TeamController;
  let service: jest.Mocked<TeamService>;

  const mockTeamDto: ClientTeamDto = {
    id: '507f1f77bcf86cd799439011',
    name: 'Engineering Team',
    description: 'Our amazing team',
    ownerId: '507f1f77bcf86cd799439012',
    memberIds: ['507f1f77bcf86cd799439012'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockSession: SessionInfo = {
    userId: '507f1f77bcf86cd799439012',
    email: 'john@example.com',
    role: Role.User,
    creationDate: Date.now(),
    createdAt: Date.now(),
    expiresAt: Date.now() + 3600000,
    serverVersion: '1.0.0',
  };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [{ provide: TeamService, useValue: mockService }],
    }).compile();

    controller = module.get<TeamController>(TeamController);
    service = module.get(TeamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of teams with default pagination', async () => {
      const teams = [mockTeamDto];
      service.findAll.mockResolvedValue(teams);

      const result = await controller.findAll();

      expect(result).toEqual(teams);
      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should return array of teams with custom pagination', async () => {
      const teams = [mockTeamDto];
      service.findAll.mockResolvedValue(teams);

      const result = await controller.findAll(10, 20);

      expect(result).toEqual(teams);
      expect(service.findAll).toHaveBeenCalledWith(10, 20);
    });
  });

  describe('findById', () => {
    it('should return team by ID', async () => {
      service.findById.mockResolvedValue(mockTeamDto);

      const result = await controller.findById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockTeamDto);
      expect(service.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('create', () => {
    it('should create a new team', async () => {
      const createDto: CreateTeamDto = {
        name: 'New Team',
        description: 'Team description',
      };

      const createdTeam = { ...mockTeamDto, ...createDto };
      service.create.mockResolvedValue(createdTeam);

      const result = await controller.create(createDto, mockSession);

      expect(result).toEqual(createdTeam);
      expect(service.create).toHaveBeenCalledWith(createDto, mockSession.userId);
    });
  });

  describe('update', () => {
    it('should update a team', async () => {
      const updateDto: UpdateTeamDto = {
        name: 'Updated Team',
      };

      const updatedTeam = { ...mockTeamDto, ...updateDto };
      service.update.mockResolvedValue(updatedTeam);

      const result = await controller.update('507f1f77bcf86cd799439011', updateDto, mockSession);

      expect(result).toEqual(updatedTeam);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto, mockSession.userId, mockSession.role);
    });
  });

  describe('delete', () => {
    it('should delete a team', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('507f1f77bcf86cd799439011', mockSession);

      expect(service.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011', mockSession.userId, mockSession.role);
    });
  });

  describe('addMember', () => {
    it('should add a member to the team', async () => {
      const addMemberDto: AddMemberDto = {
        userId: '507f1f77bcf86cd799439014',
      };

      const updatedTeam = {
        ...mockTeamDto,
        memberIds: [...mockTeamDto.memberIds, addMemberDto.userId],
      };
      service.addMember.mockResolvedValue(updatedTeam);

      const result = await controller.addMember('507f1f77bcf86cd799439011', addMemberDto, mockSession);

      expect(result).toEqual(updatedTeam);
      expect(service.addMember).toHaveBeenCalledWith('507f1f77bcf86cd799439011', addMemberDto.userId, mockSession.userId, mockSession.role);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from the team', async () => {
      const memberToRemove = '507f1f77bcf86cd799439013';
      const updatedTeam = {
        ...mockTeamDto,
        memberIds: mockTeamDto.memberIds.filter((id) => id !== memberToRemove),
      };
      service.removeMember.mockResolvedValue(updatedTeam);

      const result = await controller.removeMember('507f1f77bcf86cd799439011', memberToRemove, mockSession);

      expect(result).toEqual(updatedTeam);
      expect(service.removeMember).toHaveBeenCalledWith('507f1f77bcf86cd799439011', memberToRemove, mockSession.userId, mockSession.role);
    });
  });
});
