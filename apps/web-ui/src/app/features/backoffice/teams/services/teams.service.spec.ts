import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TeamsService } from './teams.service';
import { ApiTeamService } from '@ai-nx-starter/api-client';
import { ClientTeamDto, CreateTeamDto, UpdateTeamDto } from '@ai-nx-starter/types';

describe('TeamsService', () => {
  let service: TeamsService;
  let apiTeamService: jest.Mocked<ApiTeamService>;

  const mockTeam: ClientTeamDto = {
    id: 'team-123',
    name: 'Engineering Team',
    description: 'Our amazing team',
    ownerId: 'user-123',
    memberIds: ['user-123', 'user-456'],
    createdAt: new Date('2025-01-01'),
  };

  const mockTeam2: ClientTeamDto = {
    id: 'team-456',
    name: 'Product Team',
    description: 'Product management',
    ownerId: 'user-789',
    memberIds: ['user-789'],
    createdAt: new Date('2025-01-02'),
  };

  beforeEach(() => {
    const mockApiTeamService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [TeamsService, { provide: ApiTeamService, useValue: mockApiTeamService }],
    });

    service = TestBed.inject(TeamsService);
    apiTeamService = TestBed.inject(ApiTeamService) as jest.Mocked<ApiTeamService>;
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

  describe('getTeams', () => {
    it('should get all teams without parameters', (done) => {
      const teams = [mockTeam, mockTeam2];
      apiTeamService.findAll.mockReturnValue(of(teams));

      service.getTeams().subscribe((result) => {
        expect(result).toEqual(teams);
        expect(apiTeamService.findAll).toHaveBeenCalledWith(undefined, undefined);
        done();
      });
    });

    it('should get teams with limit parameter', (done) => {
      const teams = [mockTeam];
      apiTeamService.findAll.mockReturnValue(of(teams));

      service.getTeams(10).subscribe((result) => {
        expect(result).toEqual(teams);
        expect(apiTeamService.findAll).toHaveBeenCalledWith(10, undefined);
        done();
      });
    });

    it('should get teams with limit and offset parameters', (done) => {
      const teams = [mockTeam2];
      apiTeamService.findAll.mockReturnValue(of(teams));

      service.getTeams(5, 20).subscribe((result) => {
        expect(result).toEqual(teams);
        expect(apiTeamService.findAll).toHaveBeenCalledWith(5, 20);
        done();
      });
    });

    it('should set loading state correctly', (done) => {
      const teams = [mockTeam];
      apiTeamService.findAll.mockReturnValue(of(teams));

      const loadingStates: boolean[] = [];
      service.loading$.subscribe((loading) => loadingStates.push(loading));

      service.getTeams().subscribe(() => {
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });
  });

  describe('getTeamById', () => {
    it('should get team by ID', (done) => {
      apiTeamService.findById.mockReturnValue(of(mockTeam));

      service.getTeamById('team-123').subscribe((result) => {
        expect(result).toEqual(mockTeam);
        expect(apiTeamService.findById).toHaveBeenCalledWith('team-123');
        done();
      });
    });

    it('should set loading state correctly', (done) => {
      apiTeamService.findById.mockReturnValue(of(mockTeam));

      const loadingStates: boolean[] = [];
      service.loading$.subscribe((loading) => loadingStates.push(loading));

      service.getTeamById('team-123').subscribe(() => {
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });
  });

  describe('createTeam', () => {
    it('should create a new team', (done) => {
      const createDto: CreateTeamDto = {
        name: 'New Team',
        description: 'New team description',
      };

      const createdTeam: ClientTeamDto = {
        ...mockTeam,
        ...createDto,
      };

      apiTeamService.create.mockReturnValue(of(createdTeam));

      service.createTeam(createDto).subscribe((result) => {
        expect(result).toEqual(createdTeam);
        expect(apiTeamService.create).toHaveBeenCalledWith(createDto);
        done();
      });
    });

    it('should set loading state correctly', (done) => {
      const createDto: CreateTeamDto = {
        name: 'New Team',
        description: 'Description',
      };

      apiTeamService.create.mockReturnValue(of(mockTeam));

      const loadingStates: boolean[] = [];
      service.loading$.subscribe((loading) => loadingStates.push(loading));

      service.createTeam(createDto).subscribe(() => {
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });
  });

  describe('updateTeam', () => {
    it('should update an existing team', (done) => {
      const updateDto: UpdateTeamDto = {
        name: 'Updated Team',
      };

      const updatedTeam: ClientTeamDto = {
        ...mockTeam,
        ...updateDto,
      };

      apiTeamService.update.mockReturnValue(of(updatedTeam));

      service.updateTeam('team-123', updateDto).subscribe((result) => {
        expect(result).toEqual(updatedTeam);
        expect(apiTeamService.update).toHaveBeenCalledWith('team-123', updateDto);
        done();
      });
    });
  });

  describe('deleteTeam', () => {
    it('should delete a team', (done) => {
      apiTeamService.delete.mockReturnValue(of(void 0));

      service.deleteTeam('team-123').subscribe(() => {
        expect(apiTeamService.delete).toHaveBeenCalledWith('team-123');
        done();
      });
    });

    it('should set loading state correctly', (done) => {
      apiTeamService.delete.mockReturnValue(of(void 0));

      const loadingStates: boolean[] = [];
      service.loading$.subscribe((loading) => loadingStates.push(loading));

      service.deleteTeam('team-123').subscribe(() => {
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });
  });

  describe('addMember', () => {
    it('should add a member to a team', (done) => {
      const updatedTeam: ClientTeamDto = {
        ...mockTeam,
        memberIds: [...mockTeam.memberIds, 'user-999'],
      };

      apiTeamService.addMember.mockReturnValue(of(updatedTeam));

      service.addMember('team-123', 'user-999').subscribe((result) => {
        expect(result).toEqual(updatedTeam);
        expect(apiTeamService.addMember).toHaveBeenCalledWith('team-123', { userId: 'user-999' });
        done();
      });
    });

    it('should set loading state correctly', (done) => {
      apiTeamService.addMember.mockReturnValue(of(mockTeam));

      const loadingStates: boolean[] = [];
      service.loading$.subscribe((loading) => loadingStates.push(loading));

      service.addMember('team-123', 'user-999').subscribe(() => {
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });
  });

  describe('removeMember', () => {
    it('should remove a member from a team', (done) => {
      const updatedTeam: ClientTeamDto = {
        ...mockTeam,
        memberIds: ['user-123'],
      };

      apiTeamService.removeMember.mockReturnValue(of(updatedTeam));

      service.removeMember('team-123', 'user-456').subscribe((result) => {
        expect(result).toEqual(updatedTeam);
        expect(apiTeamService.removeMember).toHaveBeenCalledWith('team-123', 'user-456');
        done();
      });
    });

    it('should set loading state correctly', (done) => {
      apiTeamService.removeMember.mockReturnValue(of(mockTeam));

      const loadingStates: boolean[] = [];
      service.loading$.subscribe((loading) => loadingStates.push(loading));

      service.removeMember('team-123', 'user-456').subscribe(() => {
        setTimeout(() => {
          expect(loadingStates).toContain(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        }, 0);
      });
    });
  });
});
