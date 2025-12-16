import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository, ObjectId } from 'typeorm';
import { TeamDbService } from './team.db-service';
import { Team } from '../entities/team.entity';

describe('TeamDbService', () => {
  let service: TeamDbService;
  let repository: jest.Mocked<MongoRepository<Team>>;

  const mockTeam: Team = {
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    id: '507f1f77bcf86cd799439011',
    name: 'Engineering Team',
    description: 'Our amazing engineering team',
    ownerId: new ObjectId('507f1f77bcf86cd799439012'),
    memberIds: [new ObjectId('507f1f77bcf86cd799439012'), new ObjectId('507f1f77bcf86cd799439013')],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamDbService,
        {
          provide: getRepositoryToken(Team),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TeamDbService>(TeamDbService);
    repository = module.get(getRepositoryToken(Team));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('findById', () => {
    it('should return team when found', async () => {
      repository.findOneBy.mockResolvedValue(mockTeam);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockTeam);
      expect(repository.findOneBy).toHaveBeenCalledWith({ _id: expect.any(ObjectId) });
    });

    it('should return null when team not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });

    it('should return null when invalid ObjectId', async () => {
      const result = await service.findById('invalid-id');

      expect(result).toBeNull();
      expect(repository.findOneBy).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of teams with default pagination', async () => {
      const teams = [mockTeam];
      repository.find.mockResolvedValue(teams);

      const result = await service.findAll();

      expect(result).toEqual(teams);
      expect(repository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        order: { createdAt: 'DESC' },
      });
    });

    it('should return array of teams with custom pagination', async () => {
      const teams = [mockTeam];
      repository.find.mockResolvedValue(teams);

      const result = await service.findAll(10, 20);

      expect(result).toEqual(teams);
      expect(repository.find).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findByName', () => {
    it('should return team when found', async () => {
      repository.findOne.mockResolvedValue(mockTeam);

      const result = await service.findByName('Engineering Team');

      expect(result).toEqual(mockTeam);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: 'Engineering Team' },
      });
    });

    it('should return null when team not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByName('Nonexistent Team');

      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('should return total count of teams', async () => {
      repository.count.mockResolvedValue(42);

      const result = await service.count();

      expect(result).toBe(42);
      expect(repository.count).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create team with owner and members', async () => {
      const createData = {
        name: 'New Team',
        description: 'Team description',
        ownerId: new ObjectId('507f1f77bcf86cd799439012'),
        memberIds: [new ObjectId('507f1f77bcf86cd799439012')],
      };

      const createdTeam = { ...mockTeam, ...createData, id: mockTeam.id };
      repository.create.mockReturnValue(createdTeam as any);
      repository.save.mockResolvedValue(createdTeam as any);

      const result = await service.create(createData);

      expect(repository.create).toHaveBeenCalledWith(createData);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(createdTeam);
    });
  });

  describe('update', () => {
    it('should update team and return updated entity', async () => {
      const updateData = { name: 'Updated Team' };
      const updatedTeam = { ...mockTeam, ...updateData, id: mockTeam.id };

      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      repository.findOneBy.mockResolvedValue(updatedTeam as any);

      const result = await service.update('507f1f77bcf86cd799439011', updateData);

      expect(repository.update).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        expect.objectContaining({ ...updateData, updatedAt: expect.any(Date) }),
      );
      expect(result).toEqual(updatedTeam);
    });

    it('should return null when team not found', async () => {
      repository.update.mockResolvedValue({ affected: 0, raw: {}, generatedMaps: [] });

      const result = await service.update('507f1f77bcf86cd799439011', { name: 'Test' });

      expect(result).toBeNull();
    });

    it('should return null when invalid ObjectId', async () => {
      const result = await service.update('invalid-id', { name: 'Test' });

      expect(result).toBeNull();
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete team and return true', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.delete('507f1f77bcf86cd799439011');

      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return false when team not found', async () => {
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

  describe('addMember', () => {
    it('should add member to team', async () => {
      const teamId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439014';
      const teamWithNewMember = {
        ...mockTeam,
        memberIds: [...mockTeam.memberIds, new ObjectId(userId)],
      };

      repository.findOneBy.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue(teamWithNewMember as any);

      const result = await service.addMember(teamId, userId);

      expect(repository.findOneBy).toHaveBeenCalledWith({ _id: expect.any(ObjectId) });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(teamWithNewMember);
    });

    it('should return team if user is already a member', async () => {
      const teamId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012'; // Already a member

      repository.findOneBy.mockResolvedValue(mockTeam);

      const result = await service.addMember(teamId, userId);

      expect(result).toEqual(mockTeam);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return null when team not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.addMember('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439014');

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return null when invalid ObjectId', async () => {
      const result = await service.addMember('invalid-id', 'invalid-user-id');

      expect(result).toBeNull();
      expect(repository.findOneBy).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    it('should remove member from team', async () => {
      const teamId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439013';
      const teamWithoutMember = {
        ...mockTeam,
        memberIds: [new ObjectId('507f1f77bcf86cd799439012')],
      };

      repository.findOneBy.mockResolvedValue(mockTeam);
      repository.save.mockResolvedValue(teamWithoutMember as any);

      const result = await service.removeMember(teamId, userId);

      expect(repository.findOneBy).toHaveBeenCalledWith({ _id: expect.any(ObjectId) });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(teamWithoutMember);
    });

    it('should return null when team not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.removeMember('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439013');

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return null when invalid ObjectId', async () => {
      const result = await service.removeMember('invalid-id', 'invalid-user-id');

      expect(result).toBeNull();
      expect(repository.findOneBy).not.toHaveBeenCalled();
    });
  });
});
