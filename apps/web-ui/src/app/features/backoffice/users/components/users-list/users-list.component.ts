import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsersService } from '../../services/users.service';
import { ClientUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.less'],
})
export class UsersListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  users: ClientUserDto[] = [];
  filteredUsers: ClientUserDto[] = [];
  loading = false;
  searchQuery = '';

  // Table configuration
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.usersService
      .getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: ClientUserDto[]) => {
          this.users = users;
          this.applySearch();
        },
        error: (error: any) => {
          this.message.error('Failed to load users');
          console.error('Error loading users:', error);
        },
      });
  }

  private subscribeToLoading(): void {
    this.usersService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  onSearch(): void {
    this.applySearch();
  }

  private applySearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.role?.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
    }
    this.total = this.filteredUsers.length;
    this.pageIndex = 1; // Reset to first page when searching
  }

  onCreateUser(): void {
    this.router.navigate(['/backoffice/users/new']);
  }

  onEditUser(user: ClientUserDto): void {
    this.router.navigate(['/backoffice/users', user.id, 'edit']);
  }

  onDeleteUser(user: ClientUserDto): void {
    this.usersService
      .deleteUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('User deleted successfully');
          this.loadUsers(); // Refresh the list
        },
        error: (error: Error) => {
          this.message.error('Failed to delete user');
          console.error('Error deleting user:', error);
        },
      });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1; // Reset to first page when changing page size
  }

  // Get paginated data for current page
  get paginatedUsers(): ClientUserDto[] {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  // Helper method to get role badge color
  getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'Admin':
        return 'red';
      case 'User':
        return 'blue';
      default:
        return 'default';
    }
  }
}
