import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamDbService, UserDbService } from '@ai-nx-starter/data-access-layer';
import { TeamMapper } from './team.mapper';
import { ClientTeamDto, CreateTeamDto, UpdateTeamDto, Role } from '@ai-nx-starter/types';
import { Team, User } from '@ai-nx-starter/data-access-layer';
import { ObjectId } from 'typeorm';

describe('TeamService', () => {
  let service: TeamService;
  let teamDbService: jest.Mocked<TeamDbService>;
  let userDbService: jest.Mocked<UserDbService>;
  let teamMapper: jest.Mocked<TeamMapper>;

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

  const mockTeam: Team = {
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    id: '507f1f77bcf86cd799439011',
    name: 'Engineering Team',
    description: 'Our amazing team',
    ownerId: new ObjectId('507f1f77bcf86cd799439012'),
    memberIds: [new ObjectId('507f1f77bcf86cd799439012')],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTeamDto: ClientTeamDto = {
    id: '507f1f77bcf86cd799439011',
    name: 'Engineering Team',
    description: 'Our amazing team',
    ownerId: '507f1f77bcf86cd799439012',
    memberIds: ['507f1f77bcf86cd799439012'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockTeamDbService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
    };

    const mockUserDbService = {
      findById: jest.fn(),
    };

    const mockTeamMapper = {
      toDto: jest.fn(),
      toDtoWithRelations: jest.fn(),
      toDtoArray: jest.fn(),
      toDtoArrayWithRelations: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: TeamDbService, useValue: mockTeamDbService },
        { provide: UserDbService, useValue: mockUserDbService },
        { provide: TeamMapper, useValue: mockTeamMapper },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    teamDbService = module.get(TeamDbService);
    userDbService = module.get(UserDbService);
    teamMapper = module.get(TeamMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of team DTOs with populated relations', async () => {
      const teams = [mockTeam];
      const dtos = [mockTeamDto];

      teamDbService.findAll.mockResolvedValue(teams);
      teamMapper.toDtoArrayWithRelations.mockResolvedValue(dtos);

      const result = await service.findAll();

      expect(result).toEqual(dtos);
      expect(teamDbService.findAll).toHaveBeenCalledWith(50, 0);
      expect(teamMapper.toDtoArrayWithRelations).toHaveBeenCalledWith(teams);
    });

    it('should support custom pagination', async () => {
      const teams = [mockTeam];
      const dtos = [mockTeamDto];

      teamDbService.findAll.mockResolvedValue(teams);
      teamMapper.toDtoArrayWithRelations.mockResolvedValue(dtos);

      const result = await service.findAll(10, 20);

      expect(result).toEqual(dtos);
      expect(teamDbService.findAll).toHaveBeenCalledWith(10, 20);
    });
  });

  describe('findById', () => {
    it('should return team DTO with populated relations when found', async () => {
      teamDbService.findById.mockResolvedValue(mockTeam);
      teamMapper.toDtoWithRelations.mockResolvedValue(mockTeamDto);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockTeamDto);
      expect(teamDbService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(teamMapper.toDtoWithRelations).toHaveBeenCalledWith(mockTeam);
    });

    it('should throw NotFoundException when team not found', async () => {
      teamDbService.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(new NotFoundException('Team with ID nonexistent-id not found'));
    });
  });

  describe('create', () => {
    const createDto: CreateTeamDto = {
      name: 'New Team',
      description: 'Team description',
    };

    it('should create team with creator as owner and member', async () => {
      const userId = '507f1f77bcf86cd799439012';
      const createdTeam: Team = {
        _id: mockTeam._id,
        id: mockTeam._id.toString(),
        name: 'New Team',
        description: 'Team description',
        ownerId: mockTeam.ownerId,
        memberIds: mockTeam.memberIds,
        createdAt: mockTeam.createdAt,
        updatedAt: mockTeam.updatedAt,
      };

      teamDbService.findByName.mockResolvedValue(null);
      userDbService.findById.mockResolvedValue(mockUser);
      teamDbService.create.mockResolvedValue(createdTeam);
      teamMapper.toDtoWithRelations.mockResolvedValue({ ...mockTeamDto, name: 'New Team' });

      const result = await service.create(createDto, userId);

      expect(result).toEqual({ ...mockTeamDto, name: 'New Team' });
      expect(teamDbService.findByName).toHaveBeenCalledWith('New Team');
      expect(userDbService.findById).toHaveBeenCalledWith(userId);
      expect(teamDbService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Team',
          description: 'Team description',
          ownerId: expect.any(ObjectId),
          memberIds: [expect.any(ObjectId)],
        }),
      );
    });

    it('should throw ConflictException when team name already exists', async () => {
      teamDbService.findByName.mockResolvedValue(mockTeam);

      await expect(service.create(createDto, '507f1f77bcf86cd799439012')).rejects.toThrow(
        new ConflictException('Team with name "New Team" already exists'),
      );

      expect(teamDbService.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      teamDbService.findByName.mockResolvedValue(null);
      userDbService.findById.mockResolvedValue(null);

      await expect(service.create(createDto, 'nonexistent-user')).rejects.toThrow(
        new NotFoundException('User with ID nonexistent-user not found'),
      );

      expect(teamDbService.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateTeamDto = {
      name: 'Updated Team',
    };

    it('should update team when user is owner', async () => {
      const userId = '507f1f77bcf86cd799439012';
      const updatedTeam: Team = {
        ...mockTeam,
        id: mockTeam.id,
        name: 'Updated Team',
      };

      teamDbService.findById.mockResolvedValue(mockTeam);
      teamDbService.findByName.mockResolvedValue(null);
      teamDbService.update.mockResolvedValue(updatedTeam);
      teamMapper.toDtoWithRelations.mockResolvedValue({ ...mockTeamDto, name: 'Updated Team' });

      const result = await service.update('507f1f77bcf86cd799439011', updateDto, userId, Role.User);

      expect(result).toEqual({ ...mockTeamDto, name: 'Updated Team' });
      expect(teamDbService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });

    it('should update team when user is Admin', async () => {
      const adminId = 'admin-id';
      const updatedTeam: Team = {
        ...mockTeam,
        id: mockTeam.id,
        name: 'Updated Team',
      };

      teamDbService.findById.mockResolvedValue(mockTeam);
      teamDbService.findByName.mockResolvedValue(null);
      teamDbService.update.mockResolvedValue(updatedTeam);
      teamMapper.toDtoWithRelations.mockResolvedValue({ ...mockTeamDto, name: 'Updated Team' });

      const result = await service.update('507f1f77bcf86cd799439011', updateDto, adminId, Role.Admin);

      expect(result).toEqual({ ...mockTeamDto, name: 'Updated Team' });
      expect(teamDbService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });

    it('should throw ForbiddenException when user is not owner or Admin', async () => {
      const otherUserId = 'other-user-id';

      teamDbService.findById.mockResolvedValue(mockTeam);

      await expect(service.update('507f1f77bcf86cd799439011', updateDto, otherUserId, Role.User)).rejects.toThrow(
        new ForbiddenException('Only the team owner or Admin can update this team'),
      );

      expect(teamDbService.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      teamDbService.findById.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateDto, '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new NotFoundException('Team with ID nonexistent-id not found'),
      );
    });

    it('should throw ConflictException when updating to existing team name', async () => {
      const otherTeam: Team = {
        ...mockTeam,
        _id: new ObjectId('507f1f77bcf86cd799439013'),
        id: '507f1f77bcf86cd799439013',
      };

      teamDbService.findById.mockResolvedValue(mockTeam);
      teamDbService.findByName.mockResolvedValue(otherTeam);

      await expect(service.update('507f1f77bcf86cd799439011', updateDto, '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new ConflictException('Team with name "Updated Team" already exists'),
      );

      expect(teamDbService.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same name', async () => {
      const updateWithSameName: UpdateTeamDto = { name: 'Engineering Team' };
      const updatedTeam: Team = {
        ...mockTeam,
        id: mockTeam.id,
      };

      teamDbService.findById.mockResolvedValue(mockTeam);
      teamDbService.update.mockResolvedValue(updatedTeam);
      teamMapper.toDtoWithRelations.mockResolvedValue(mockTeamDto);

      const result = await service.update('507f1f77bcf86cd799439011', updateWithSameName, '507f1f77bcf86cd799439012', Role.User);

      expect(result).toEqual(mockTeamDto);
      expect(teamDbService.findByName).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when update fails', async () => {
      teamDbService.findById.mockResolvedValue(mockTeam);
      teamDbService.findByName.mockResolvedValue(null);
      teamDbService.update.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', updateDto, '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new NotFoundException('Failed to update team with ID 507f1f77bcf86cd799439011'),
      );
    });
  });

  describe('delete', () => {
    it('should delete team when user is owner', async () => {
      const userId = '507f1f77bcf86cd799439012';

      teamDbService.findById.mockResolvedValue(mockTeam);
      teamDbService.delete.mockResolvedValue(true);

      await service.delete('507f1f77bcf86cd799439011', userId, Role.User);

      expect(teamDbService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should delete team when user is Admin', async () => {
      const adminId = 'admin-id';

      teamDbService.findById.mockResolvedValue(mockTeam);
      teamDbService.delete.mockResolvedValue(true);

      await service.delete('507f1f77bcf86cd799439011', adminId, Role.Admin);

      expect(teamDbService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw ForbiddenException when user is not owner or Admin', async () => {
      const otherUserId = 'other-user-id';

      teamDbService.findById.mockResolvedValue(mockTeam);

      await expect(service.delete('507f1f77bcf86cd799439011', otherUserId, Role.User)).rejects.toThrow(
        new ForbiddenException('Only the team owner or Admin can delete this team'),
      );

      expect(teamDbService.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      teamDbService.findById.mockResolvedValue(null);

      await expect(service.delete('nonexistent-id', '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new NotFoundException('Team with ID nonexistent-id not found'),
      );
    });

    it('should throw NotFoundException when delete fails', async () => {
      teamDbService.findById.mockResolvedValue(mockTeam);
      teamDbService.delete.mockResolvedValue(false);

      await expect(service.delete('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new NotFoundException('Failed to delete team with ID 507f1f77bcf86cd799439011'),
      );
    });
  });

  describe('addMember', () => {
    const newMemberId = '507f1f77bcf86cd799439014';

    it('should add member when user is owner', async () => {
      const userId = '507f1f77bcf86cd799439012';
      const updatedTeam: Team = {
        ...mockTeam,
        id: mockTeam.id,
        memberIds: [...mockTeam.memberIds, new ObjectId(newMemberId)],
      };

      teamDbService.findById.mockResolvedValue(mockTeam);
      userDbService.findById.mockResolvedValue(mockUser);
      teamDbService.addMember.mockResolvedValue(updatedTeam);
      teamMapper.toDtoWithRelations.mockResolvedValue({
        ...mockTeamDto,
        memberIds: [...mockTeamDto.memberIds, newMemberId],
      });

      const result = await service.addMember('507f1f77bcf86cd799439011', newMemberId, userId, Role.User);

      expect(result.memberIds).toContain(newMemberId);
      expect(teamDbService.addMember).toHaveBeenCalledWith('507f1f77bcf86cd799439011', newMemberId);
    });

    it('should add member when user is Admin', async () => {
      const adminId = 'admin-id';
      const updatedTeam: Team = {
        ...mockTeam,
        id: mockTeam.id,
        memberIds: [...mockTeam.memberIds, new ObjectId(newMemberId)],
      };

      teamDbService.findById.mockResolvedValue(mockTeam);
      userDbService.findById.mockResolvedValue(mockUser);
      teamDbService.addMember.mockResolvedValue(updatedTeam);
      teamMapper.toDtoWithRelations.mockResolvedValue({
        ...mockTeamDto,
        memberIds: [...mockTeamDto.memberIds, newMemberId],
      });

      const result = await service.addMember('507f1f77bcf86cd799439011', newMemberId, adminId, Role.Admin);

      expect(result.memberIds).toContain(newMemberId);
    });

    it('should throw ForbiddenException when user is not owner or Admin', async () => {
      const otherUserId = 'other-user-id';

      teamDbService.findById.mockResolvedValue(mockTeam);

      await expect(service.addMember('507f1f77bcf86cd799439011', newMemberId, otherUserId, Role.User)).rejects.toThrow(
        new ForbiddenException('Only the team owner or Admin can add members'),
      );

      expect(teamDbService.addMember).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      teamDbService.findById.mockResolvedValue(null);

      await expect(service.addMember('nonexistent-id', newMemberId, '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new NotFoundException('Team with ID nonexistent-id not found'),
      );
    });

    it('should throw NotFoundException when member user not found', async () => {
      teamDbService.findById.mockResolvedValue(mockTeam);
      userDbService.findById.mockResolvedValue(null);

      await expect(service.addMember('507f1f77bcf86cd799439011', newMemberId, '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new NotFoundException('User with ID ' + newMemberId + ' not found'),
      );

      expect(teamDbService.addMember).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when addMember fails', async () => {
      teamDbService.findById.mockResolvedValue(mockTeam);
      userDbService.findById.mockResolvedValue(mockUser);
      teamDbService.addMember.mockResolvedValue(null);

      await expect(service.addMember('507f1f77bcf86cd799439011', newMemberId, '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new BadRequestException('Failed to add member to team'),
      );
    });
  });

  describe('removeMember', () => {
    const memberToRemove = '507f1f77bcf86cd799439013';

    it('should remove member when user is owner', async () => {
      const userId = '507f1f77bcf86cd799439012';
      const teamWithMember: Team = {
        ...mockTeam,
        id: mockTeam.id,
        memberIds: [new ObjectId('507f1f77bcf86cd799439012'), new ObjectId(memberToRemove)],
      };
      const updatedTeam: Team = {
        ...mockTeam,
        id: mockTeam.id,
        memberIds: [new ObjectId('507f1f77bcf86cd799439012')],
      };

      teamDbService.findById.mockResolvedValue(teamWithMember);
      teamDbService.removeMember.mockResolvedValue(updatedTeam);
      teamMapper.toDtoWithRelations.mockResolvedValue({
        ...mockTeamDto,
        memberIds: ['507f1f77bcf86cd799439012'],
      });

      const result = await service.removeMember('507f1f77bcf86cd799439011', memberToRemove, userId, Role.User);

      expect(result.memberIds).not.toContain(memberToRemove);
      expect(teamDbService.removeMember).toHaveBeenCalledWith('507f1f77bcf86cd799439011', memberToRemove);
    });

    it('should throw BadRequestException when trying to remove owner', async () => {
      const userId = '507f1f77bcf86cd799439012';
      const ownerId = '507f1f77bcf86cd799439012';

      teamDbService.findById.mockResolvedValue(mockTeam);

      await expect(service.removeMember('507f1f77bcf86cd799439011', ownerId, userId, Role.User)).rejects.toThrow(
        new BadRequestException('Cannot remove the team owner from members'),
      );

      expect(teamDbService.removeMember).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not owner or Admin', async () => {
      const otherUserId = 'other-user-id';

      teamDbService.findById.mockResolvedValue(mockTeam);

      await expect(service.removeMember('507f1f77bcf86cd799439011', memberToRemove, otherUserId, Role.User)).rejects.toThrow(
        new ForbiddenException('Only the team owner or Admin can remove members'),
      );

      expect(teamDbService.removeMember).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      teamDbService.findById.mockResolvedValue(null);

      await expect(service.removeMember('nonexistent-id', memberToRemove, '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new NotFoundException('Team with ID nonexistent-id not found'),
      );
    });

    it('should throw BadRequestException when removeMember fails', async () => {
      const teamWithMember: Team = {
        ...mockTeam,
        id: mockTeam.id,
        memberIds: [new ObjectId('507f1f77bcf86cd799439012'), new ObjectId(memberToRemove)],
      };

      teamDbService.findById.mockResolvedValue(teamWithMember);
      teamDbService.removeMember.mockResolvedValue(null);

      await expect(service.removeMember('507f1f77bcf86cd799439011', memberToRemove, '507f1f77bcf86cd799439012', Role.User)).rejects.toThrow(
        new BadRequestException('Failed to remove member from team'),
      );
    });
  });
});
