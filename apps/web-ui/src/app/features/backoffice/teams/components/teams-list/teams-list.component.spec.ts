import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TeamsListComponent } from './teams-list.component';
import { TeamsService } from '../../services/teams.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { ClientTeamDto, ClientUserDto, Role } from '@ai-nx-starter/types';

describe('TeamsListComponent', () => {
  let component: TeamsListComponent;
  let fixture: ComponentFixture<TeamsListComponent>;
  let teamsService: jest.Mocked<TeamsService>;
  let messageService: jest.Mocked<NzMessageService>;
  let modalService: jest.Mocked<NzModalService>;

  const mockOwner: ClientUserDto = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: Role.User,
    phone: '',
    picture: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTeams: ClientTeamDto[] = [
    {
      id: 'team-1',
      name: 'Engineering Team',
      description: 'Software development team',
      ownerId: 'user-123',
      memberIds: ['user-123', 'user-456'],
      owner: mockOwner,
      members: [mockOwner],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'team-2',
      name: 'Product Team',
      description: 'Product management team',
      ownerId: 'user-789',
      memberIds: ['user-789'],
      owner: {
        ...mockOwner,
        id: 'user-789',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      },
      members: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    const mockTeamsService = {
      getTeams: jest.fn(),
      deleteTeam: jest.fn(),
      loading$: of(false),
    };

    const mockMessageService = {
      success: jest.fn(),
      error: jest.fn(),
    };

    const mockModalService = {
      create: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [TeamsListComponent],
      providers: [
        { provide: TeamsService, useValue: mockTeamsService },
        { provide: NzMessageService, useValue: mockMessageService },
        { provide: NzModalService, useValue: mockModalService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsListComponent);
    component = fixture.componentInstance;
    teamsService = TestBed.inject(TeamsService) as jest.Mocked<TeamsService>;
    messageService = TestBed.inject(NzMessageService) as jest.Mocked<NzMessageService>;
    modalService = TestBed.inject(NzModalService) as jest.Mocked<NzModalService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading state', () => {
    it('should subscribe to loading state', (done) => {
      teamsService.getTeams.mockReturnValue(of(mockTeams));

      component.ngOnInit();

      teamsService.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });
  });

  describe('ngOnInit', () => {
    it('should load teams on init', () => {
      teamsService.getTeams.mockReturnValue(of(mockTeams));

      component.ngOnInit();

      expect(teamsService.getTeams).toHaveBeenCalled();
      expect(component.teams).toEqual(mockTeams);
      expect(component.filteredTeams).toEqual(mockTeams);
    });

    it('should handle error when loading teams fails', () => {
      const error = new Error('Load failed');
      teamsService.getTeams.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.ngOnInit();

      expect(messageService.error).toHaveBeenCalledWith('Failed to load teams');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading teams:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      teamsService.getTeams.mockReturnValue(of(mockTeams));
      component.ngOnInit();
    });

    it('should filter teams by name', () => {
      component.searchQuery = 'engineering';
      component.onSearch();

      expect(component.filteredTeams).toHaveLength(1);
      expect(component.filteredTeams[0].name).toBe('Engineering Team');
    });

    it('should filter teams by description', () => {
      component.searchQuery = 'software';
      component.onSearch();

      expect(component.filteredTeams).toHaveLength(1);
      expect(component.filteredTeams[0].description).toBe('Software development team');
    });

    it('should filter teams by owner email', () => {
      component.searchQuery = 'jane@';
      component.onSearch();

      expect(component.filteredTeams).toHaveLength(1);
      expect(component.filteredTeams[0].owner?.email).toBe('jane@example.com');
    });

    it('should be case insensitive', () => {
      component.searchQuery = 'ENGINEERING';
      component.onSearch();

      expect(component.filteredTeams).toHaveLength(1);
    });

    it('should show all teams when search is empty', () => {
      component.searchQuery = '';
      component.onSearch();

      expect(component.filteredTeams).toEqual(mockTeams);
    });

    it('should reset to page 1 when searching', () => {
      component.pageIndex = 3;
      component.searchQuery = 'engineering';
      component.onSearch();

      expect(component.pageIndex).toBe(1);
    });

    it('should update total count after search', () => {
      component.searchQuery = 'engineering';
      component.onSearch();

      expect(component.total).toBe(1);
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      teamsService.getTeams.mockReturnValue(of(mockTeams));
      component.ngOnInit();
    });

    it('should return paginated teams', () => {
      component.pageSize = 1;
      component.pageIndex = 1;

      const paginated = component.paginatedTeams;

      expect(paginated).toHaveLength(1);
      expect(paginated[0].id).toBe('team-1');
    });

    it('should return second page of teams', () => {
      component.pageSize = 1;
      component.pageIndex = 2;

      const paginated = component.paginatedTeams;

      expect(paginated).toHaveLength(1);
      expect(paginated[0].id).toBe('team-2');
    });

    it('should handle page index change', () => {
      component.onPageIndexChange(2);

      expect(component.pageIndex).toBe(2);
    });

    it('should reset to page 1 when changing page size', () => {
      component.pageIndex = 3;
      component.onPageSizeChange(20);

      expect(component.pageSize).toBe(20);
      expect(component.pageIndex).toBe(1);
    });
  });

  describe('team actions', () => {
    beforeEach(() => {
      teamsService.getTeams.mockReturnValue(of(mockTeams));
      component.ngOnInit();
    });

    it('should open create modal and refresh on close', () => {
      const mockModalRef = {
        afterClose: of(true),
      } as NzModalRef;

      modalService.create.mockReturnValue(mockModalRef);

      component.onCreateTeam();

      expect(modalService.create).toHaveBeenCalledWith({
        nzTitle: 'Create Team',
        nzContent: expect.anything(),
        nzData: { team: null },
        nzFooter: null,
        nzWidth: 600,
      });
      expect(teamsService.getTeams).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it('should not refresh when create modal is cancelled', () => {
      const mockModalRef = {
        afterClose: of(null),
      } as NzModalRef;

      modalService.create.mockReturnValue(mockModalRef);

      component.onCreateTeam();

      expect(teamsService.getTeams).toHaveBeenCalledTimes(1); // Only initial load
    });

    it('should open edit modal with team data and refresh on close', () => {
      const mockModalRef = {
        afterClose: of(true),
      } as NzModalRef;

      modalService.create.mockReturnValue(mockModalRef);

      component.onEditTeam(mockTeams[0]);

      expect(modalService.create).toHaveBeenCalledWith({
        nzTitle: 'Edit Team',
        nzContent: expect.anything(),
        nzData: { team: mockTeams[0] },
        nzFooter: null,
        nzWidth: 600,
      });
      expect(teamsService.getTeams).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it('should not refresh when edit modal is cancelled', () => {
      const mockModalRef = {
        afterClose: of(null),
      } as NzModalRef;

      modalService.create.mockReturnValue(mockModalRef);

      component.onEditTeam(mockTeams[0]);

      expect(teamsService.getTeams).toHaveBeenCalledTimes(1); // Only initial load
    });

    it('should delete team successfully', () => {
      teamsService.deleteTeam.mockReturnValue(of(void 0));

      component.onDeleteTeam(mockTeams[0]);

      expect(teamsService.deleteTeam).toHaveBeenCalledWith('team-1');
      expect(messageService.success).toHaveBeenCalledWith('Team deleted successfully');
      expect(teamsService.getTeams).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it('should show error message when delete fails', () => {
      const error = new Error('Delete failed');
      teamsService.deleteTeam.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.onDeleteTeam(mockTeams[0]);

      expect(messageService.error).toHaveBeenCalledWith('Failed to delete team');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting team:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
