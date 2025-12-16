import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TeamFormComponent } from './team-form.component';
import { TeamsService } from '../../services/teams.service';
import { UsersService } from '../../../users/services/users.service';
import { ClientTeamDto, ClientUserDto, Role } from '@ai-nx-starter/types';

describe('TeamFormComponent', () => {
  let component: TeamFormComponent;
  let fixture: ComponentFixture<TeamFormComponent>;
  let teamsService: jest.Mocked<TeamsService>;
  let usersService: jest.Mocked<UsersService>;
  let messageService: jest.Mocked<NzMessageService>;
  let modalRef: jest.Mocked<NzModalRef>;

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

  const mockMember: ClientUserDto = {
    id: 'user-456',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    role: Role.User,
    phone: '',
    picture: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTeam: ClientTeamDto = {
    id: 'team-123',
    name: 'Engineering Team',
    description: 'Our amazing team',
    ownerId: 'user-123',
    memberIds: ['user-123', 'user-456'],
    owner: mockOwner,
    members: [mockOwner, mockMember],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUsers: ClientUserDto[] = [mockOwner, mockMember];

  beforeEach(async () => {
    const mockTeamsService = {
      createTeam: jest.fn(),
      updateTeam: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
      loading$: of(false),
    };

    const mockUsersService = {
      getUsers: jest.fn(),
    };

    const mockMessageService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
    };

    const mockModalRef = {
      close: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [TeamFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: TeamsService, useValue: mockTeamsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: NzMessageService, useValue: mockMessageService },
        { provide: NzModalRef, useValue: mockModalRef },
        { provide: NZ_MODAL_DATA, useValue: { team: null } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamFormComponent);
    component = fixture.componentInstance;
    teamsService = TestBed.inject(TeamsService) as jest.Mocked<TeamsService>;
    usersService = TestBed.inject(UsersService) as jest.Mocked<UsersService>;
    messageService = TestBed.inject(NzMessageService) as jest.Mocked<NzMessageService>;
    modalRef = TestBed.inject(NzModalRef) as jest.Mocked<NzModalRef>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form in create mode when no team in modal data', () => {
      usersService.getUsers.mockReturnValue(of(mockUsers));

      component.ngOnInit();

      expect(component.isEditMode).toBe(false);
      expect(component.team).toBeNull();
      expect(component.teamForm).toBeDefined();
    });

    it('should initialize form with required validators in create mode', () => {
      usersService.getUsers.mockReturnValue(of(mockUsers));

      component.ngOnInit();

      const form = component.teamForm;
      expect(form.get('name')?.hasError('required')).toBe(true);
      expect(form.get('description')?.hasError('required')).toBe(false);
    });

    it('should initialize form in edit mode when team in modal data', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TeamFormComponent],
        imports: [ReactiveFormsModule],
        providers: [
          { provide: TeamsService, useValue: teamsService },
          { provide: UsersService, useValue: usersService },
          { provide: NzMessageService, useValue: messageService },
          { provide: NzModalRef, useValue: modalRef },
          { provide: NZ_MODAL_DATA, useValue: { team: mockTeam } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(TeamFormComponent);
      component = fixture.componentInstance;
      usersService.getUsers.mockReturnValue(of(mockUsers));

      component.ngOnInit();

      expect(component.isEditMode).toBe(true);
      expect(component.team).toEqual(mockTeam);
    });

    it('should populate form with team data in edit mode', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TeamFormComponent],
        imports: [ReactiveFormsModule],
        providers: [
          { provide: TeamsService, useValue: teamsService },
          { provide: UsersService, useValue: usersService },
          { provide: NzMessageService, useValue: messageService },
          { provide: NzModalRef, useValue: modalRef },
          { provide: NZ_MODAL_DATA, useValue: { team: mockTeam } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(TeamFormComponent);
      component = fixture.componentInstance;
      usersService.getUsers.mockReturnValue(of(mockUsers));

      component.ngOnInit();

      expect(component.teamForm.value.name).toBe(mockTeam.name);
      expect(component.teamForm.value.description).toBe(mockTeam.description);
    });
  });

  describe('Load Available Users', () => {
    it('should load all users in create mode', () => {
      usersService.getUsers.mockReturnValue(of(mockUsers));

      component.ngOnInit();

      expect(usersService.getUsers).toHaveBeenCalled();
      expect(component.availableUsers).toEqual(mockUsers);
    });

    it('should filter out existing members in edit mode', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TeamFormComponent],
        imports: [ReactiveFormsModule],
        providers: [
          { provide: TeamsService, useValue: teamsService },
          { provide: UsersService, useValue: usersService },
          { provide: NzMessageService, useValue: messageService },
          { provide: NzModalRef, useValue: modalRef },
          { provide: NZ_MODAL_DATA, useValue: { team: mockTeam } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(TeamFormComponent);
      component = fixture.componentInstance;
      usersService.getUsers.mockReturnValue(of(mockUsers));

      component.ngOnInit();

      expect(component.availableUsers).toHaveLength(0); // All users are already members
    });

    it('should handle error when loading users fails', () => {
      const error = new Error('Load failed');
      usersService.getUsers.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.ngOnInit();

      expect(messageService.error).toHaveBeenCalledWith('Failed to load users');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading users:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      usersService.getUsers.mockReturnValue(of(mockUsers));
      component.ngOnInit();
    });

    it('should validate required name', () => {
      const nameControl = component.teamForm.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);

      nameControl?.setValue('Team Name');
      expect(nameControl?.hasError('required')).toBe(false);
    });

    it('should validate name minLength', () => {
      const nameControl = component.teamForm.get('name');
      nameControl?.setValue('AB');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('ABC');
      expect(nameControl?.hasError('minlength')).toBe(false);
    });

    it('should validate name maxLength', () => {
      const nameControl = component.teamForm.get('name');
      const longName = 'A'.repeat(101);
      nameControl?.setValue(longName);
      expect(nameControl?.hasError('maxlength')).toBe(true);

      nameControl?.setValue('A'.repeat(100));
      expect(nameControl?.hasError('maxlength')).toBe(false);
    });

    it('should validate description maxLength', () => {
      const descControl = component.teamForm.get('description');
      const longDesc = 'A'.repeat(501);
      descControl?.setValue(longDesc);
      expect(descControl?.hasError('maxlength')).toBe(true);

      descControl?.setValue('A'.repeat(500));
      expect(descControl?.hasError('maxlength')).toBe(false);
    });

    it('should allow optional description field', () => {
      const descControl = component.teamForm.get('description');
      descControl?.setValue('');
      expect(descControl?.valid).toBe(true);

      descControl?.setValue('Team description');
      expect(descControl?.valid).toBe(true);
    });
  });

  describe('Create Team', () => {
    beforeEach(() => {
      usersService.getUsers.mockReturnValue(of(mockUsers));
      component.ngOnInit();
    });

    it('should create team when form is valid', () => {
      teamsService.createTeam.mockReturnValue(of(mockTeam));

      component.teamForm.patchValue({
        name: 'New Team',
        description: 'Team description',
      });

      component.onSubmit();

      expect(teamsService.createTeam).toHaveBeenCalledWith({
        name: 'New Team',
        description: 'Team description',
      });
      expect(messageService.success).toHaveBeenCalledWith('Team created successfully');
      expect(modalRef.close).toHaveBeenCalledWith(true);
    });

    it('should create team with undefined description when empty', () => {
      teamsService.createTeam.mockReturnValue(of(mockTeam));

      component.teamForm.patchValue({
        name: 'New Team',
        description: '',
      });

      component.onSubmit();

      expect(teamsService.createTeam).toHaveBeenCalledWith({
        name: 'New Team',
        description: undefined,
      });
    });

    it('should not submit when form is invalid', () => {
      component.teamForm.patchValue({
        name: '',
      });

      component.onSubmit();

      expect(teamsService.createTeam).not.toHaveBeenCalled();
    });

    it('should mark all invalid fields as dirty when submitting invalid form', () => {
      component.teamForm.patchValue({
        name: '',
      });

      component.onSubmit();

      expect(component.teamForm.get('name')?.dirty).toBe(true);
    });

    it('should handle error when creating team fails', () => {
      const error = new Error('Create failed');
      teamsService.createTeam.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.teamForm.patchValue({
        name: 'New Team',
      });

      component.onSubmit();

      expect(messageService.error).toHaveBeenCalledWith('Failed to create team');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating team:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Update Team', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TeamFormComponent],
        imports: [ReactiveFormsModule],
        providers: [
          { provide: TeamsService, useValue: teamsService },
          { provide: UsersService, useValue: usersService },
          { provide: NzMessageService, useValue: messageService },
          { provide: NzModalRef, useValue: modalRef },
          { provide: NZ_MODAL_DATA, useValue: { team: mockTeam } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(TeamFormComponent);
      component = fixture.componentInstance;
      usersService.getUsers.mockReturnValue(of(mockUsers));
      component.ngOnInit();
    });

    it('should update team when form is valid', () => {
      teamsService.updateTeam.mockReturnValue(of({ ...mockTeam, name: 'Updated Team' }));

      component.teamForm.patchValue({
        name: 'Updated Team',
        description: 'Updated description',
      });

      component.onSubmit();

      expect(teamsService.updateTeam).toHaveBeenCalledWith('team-123', {
        name: 'Updated Team',
        description: 'Updated description',
      });
      expect(messageService.success).toHaveBeenCalledWith('Team updated successfully');
      expect(modalRef.close).toHaveBeenCalledWith(true);
    });

    it('should only include changed fields in update', () => {
      teamsService.updateTeam.mockReturnValue(of(mockTeam));

      component.teamForm.patchValue({
        name: mockTeam.name, // Same as original
        description: 'New description', // Changed
      });

      component.onSubmit();

      expect(teamsService.updateTeam).toHaveBeenCalledWith('team-123', {
        name: undefined,
        description: 'New description',
      });
    });

    it('should handle error when updating team fails', () => {
      const error = new Error('Update failed');
      teamsService.updateTeam.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.teamForm.patchValue({
        name: 'Updated Team',
      });

      component.onSubmit();

      expect(messageService.error).toHaveBeenCalledWith('Failed to update team');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating team:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Add Member', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TeamFormComponent],
        imports: [ReactiveFormsModule],
        providers: [
          { provide: TeamsService, useValue: teamsService },
          { provide: UsersService, useValue: usersService },
          { provide: NzMessageService, useValue: messageService },
          { provide: NzModalRef, useValue: modalRef },
          { provide: NZ_MODAL_DATA, useValue: { team: mockTeam } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(TeamFormComponent);
      component = fixture.componentInstance;
      usersService.getUsers.mockReturnValue(of(mockUsers));
      component.ngOnInit();
    });

    it('should add member successfully', () => {
      const newUser: ClientUserDto = {
        id: 'user-789',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        role: Role.User,
        phone: '',
        picture: '',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const updatedTeam = {
        ...mockTeam,
        memberIds: [...mockTeam.memberIds, newUser.id],
        members: [...(mockTeam.members || []), newUser],
      };

      teamsService.addMember.mockReturnValue(of(updatedTeam));
      component.selectedUserForAdd = newUser.id;

      component.onAddMember();

      expect(teamsService.addMember).toHaveBeenCalledWith('team-123', newUser.id);
      expect(messageService.success).toHaveBeenCalledWith('Member added successfully');
      expect(component.selectedUserForAdd).toBeNull();
      expect(usersService.getUsers).toHaveBeenCalledTimes(2); // Initial + refresh
    });

    it('should not add member when no user selected', () => {
      component.selectedUserForAdd = null;

      component.onAddMember();

      expect(teamsService.addMember).not.toHaveBeenCalled();
    });

    it('should handle error when adding member fails', () => {
      const error = new Error('Add failed');
      teamsService.addMember.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      component.selectedUserForAdd = 'user-789';

      component.onAddMember();

      expect(messageService.error).toHaveBeenCalledWith('Failed to add member');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding member:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Remove Member', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TeamFormComponent],
        imports: [ReactiveFormsModule],
        providers: [
          { provide: TeamsService, useValue: teamsService },
          { provide: UsersService, useValue: usersService },
          { provide: NzMessageService, useValue: messageService },
          { provide: NzModalRef, useValue: modalRef },
          { provide: NZ_MODAL_DATA, useValue: { team: mockTeam } },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(TeamFormComponent);
      component = fixture.componentInstance;
      usersService.getUsers.mockReturnValue(of(mockUsers));
      component.ngOnInit();
    });

    it('should remove member successfully', () => {
      const updatedTeam = {
        ...mockTeam,
        memberIds: [mockOwner.id],
        members: [mockOwner],
      };

      teamsService.removeMember.mockReturnValue(of(updatedTeam));

      component.onRemoveMember(mockMember);

      expect(teamsService.removeMember).toHaveBeenCalledWith('team-123', 'user-456');
      expect(messageService.success).toHaveBeenCalledWith('Member removed successfully');
      expect(usersService.getUsers).toHaveBeenCalledTimes(2); // Initial + refresh
    });

    it('should prevent removing the owner', () => {
      component.onRemoveMember(mockOwner);

      expect(messageService.warning).toHaveBeenCalledWith('Cannot remove the team owner');
      expect(teamsService.removeMember).not.toHaveBeenCalled();
    });

    it('should handle error when removing member fails', () => {
      const error = new Error('Remove failed');
      teamsService.removeMember.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.onRemoveMember(mockMember);

      expect(messageService.error).toHaveBeenCalledWith('Failed to remove member');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error removing member:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cancel', () => {
    it('should close modal with false when cancel is clicked', () => {
      usersService.getUsers.mockReturnValue(of(mockUsers));
      component.ngOnInit();

      component.onCancel();

      expect(modalRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Loading State', () => {
    it('should subscribe to loading state', (done) => {
      usersService.getUsers.mockReturnValue(of(mockUsers));

      component.ngOnInit();

      teamsService.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });
  });

  describe('Component Cleanup', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
