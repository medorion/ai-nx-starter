import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsersListComponent } from './users-list.component';
import { UsersService } from '../../services/users.service';
import { ClientUserDto, Role } from '@ai-nx-starter/types';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let usersService: jest.Mocked<UsersService>;
  let router: jest.Mocked<Router>;
  let messageService: jest.Mocked<NzMessageService>;
  let loadingSubject: BehaviorSubject<boolean>;

  const mockUsers: ClientUserDto[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: Role.Admin,
      phone: '+1234567890',
      picture: '',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: Role.User,
      phone: '+0987654321',
      picture: '',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    loadingSubject = new BehaviorSubject<boolean>(false);

    const mockUsersService = {
      getUsers: jest.fn(),
      deleteUser: jest.fn(),
      loading$: loadingSubject.asObservable(),
    };

    const mockRouter = {
      navigate: jest.fn(),
    };

    const mockMessageService = {
      success: jest.fn(),
      error: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [UsersListComponent],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: Router, useValue: mockRouter },
        { provide: NzMessageService, useValue: mockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
    usersService = TestBed.inject(UsersService) as jest.Mocked<UsersService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    messageService = TestBed.inject(NzMessageService) as jest.Mocked<NzMessageService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load users on initialization', () => {
      usersService.getUsers.mockReturnValue(of(mockUsers));

      component.ngOnInit();

      expect(usersService.getUsers).toHaveBeenCalled();
      expect(component.users).toEqual(mockUsers);
      expect(component.filteredUsers).toEqual(mockUsers);
    });

    it('should show error message when loading users fails', () => {
      const error = new Error('Failed to load');
      usersService.getUsers.mockReturnValue(throwError(() => error));

      component.ngOnInit();

      expect(messageService.error).toHaveBeenCalledWith('Failed to load users');
    });

    it('should subscribe to loading state', () => {
      usersService.getUsers.mockReturnValue(of(mockUsers));

      component.ngOnInit();
      loadingSubject.next(true);

      expect(component.loading).toBe(true);

      loadingSubject.next(false);
      expect(component.loading).toBe(false);
    });
  });

  describe('search functionality', () => {
    beforeEach(() => {
      usersService.getUsers.mockReturnValue(of(mockUsers));
      component.ngOnInit();
    });

    it('should filter users by first name', () => {
      component.searchQuery = 'john';
      component.onSearch();

      expect(component.filteredUsers).toHaveLength(1);
      expect(component.filteredUsers[0].firstName).toBe('John');
    });

    it('should filter users by last name', () => {
      component.searchQuery = 'smith';
      component.onSearch();

      expect(component.filteredUsers).toHaveLength(1);
      expect(component.filteredUsers[0].lastName).toBe('Smith');
    });

    it('should filter users by email', () => {
      component.searchQuery = 'jane@';
      component.onSearch();

      expect(component.filteredUsers).toHaveLength(1);
      expect(component.filteredUsers[0].email).toBe('jane@example.com');
    });

    it('should filter users by role', () => {
      component.searchQuery = 'admin';
      component.onSearch();

      expect(component.filteredUsers).toHaveLength(1);
      expect(component.filteredUsers[0].role).toBe(Role.Admin);
    });

    it('should be case insensitive', () => {
      component.searchQuery = 'JOHN';
      component.onSearch();

      expect(component.filteredUsers).toHaveLength(1);
    });

    it('should show all users when search is empty', () => {
      component.searchQuery = '';
      component.onSearch();

      expect(component.filteredUsers).toEqual(mockUsers);
    });

    it('should reset to page 1 when searching', () => {
      component.pageIndex = 3;
      component.searchQuery = 'john';
      component.onSearch();

      expect(component.pageIndex).toBe(1);
    });

    it('should update total count after search', () => {
      component.searchQuery = 'john';
      component.onSearch();

      expect(component.total).toBe(1);
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      usersService.getUsers.mockReturnValue(of(mockUsers));
      component.ngOnInit();
    });

    it('should return paginated users', () => {
      component.pageSize = 1;
      component.pageIndex = 1;

      const paginated = component.paginatedUsers;

      expect(paginated).toHaveLength(1);
      expect(paginated[0].id).toBe('1');
    });

    it('should return second page of users', () => {
      component.pageSize = 1;
      component.pageIndex = 2;

      const paginated = component.paginatedUsers;

      expect(paginated).toHaveLength(1);
      expect(paginated[0].id).toBe('2');
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

  describe('user actions', () => {
    beforeEach(() => {
      usersService.getUsers.mockReturnValue(of(mockUsers));
      component.ngOnInit();
    });

    it('should navigate to create user page', () => {
      component.onCreateUser();

      expect(router.navigate).toHaveBeenCalledWith(['/backoffice/users/new']);
    });

    it('should navigate to edit user page', () => {
      component.onEditUser(mockUsers[0]);

      expect(router.navigate).toHaveBeenCalledWith(['/backoffice/users', '1', 'edit']);
    });

    it('should delete user successfully', () => {
      usersService.deleteUser.mockReturnValue(of(void 0));

      component.onDeleteUser(mockUsers[0]);

      expect(usersService.deleteUser).toHaveBeenCalledWith('1');
      expect(messageService.success).toHaveBeenCalledWith('User deleted successfully');
      expect(usersService.getUsers).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it('should show error message when delete fails', () => {
      const error = new Error('Delete failed');
      usersService.deleteUser.mockReturnValue(throwError(() => error));

      component.onDeleteUser(mockUsers[0]);

      expect(messageService.error).toHaveBeenCalledWith('Failed to delete user');
    });
  });

  describe('getRoleBadgeColor', () => {
    it('should return red for Admin role', () => {
      expect(component.getRoleBadgeColor('Admin')).toBe('red');
    });

    it('should return blue for User role', () => {
      expect(component.getRoleBadgeColor('User')).toBe('blue');
    });

    it('should return default for unknown role', () => {
      expect(component.getRoleBadgeColor('Unknown')).toBe('default');
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
