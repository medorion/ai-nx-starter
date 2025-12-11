# Common Patterns

Frequently used patterns for forms, authentication, tables, modals, and other common UI elements in Angular applications.

---

## Authentication with AuthService

### Getting Current User

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import type { ClientUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-profile',
  template: `
    <div *ngIf="currentUser">
      <p>Logged in as: {{ currentUser.email }}</p>
      <p>Name: {{ currentUser.firstName }} {{ currentUser.lastName }}</p>
      <p>Role: {{ currentUser.role }}</p>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  currentUser: ClientUserDto | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get current user from AuthService
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }
}
```

### AuthService Implementation

```typescript
// apps/web-ui/src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import type { ClientUserDto } from '@ai-nx-starter/types';
import { ApiAuthService } from '@ai-nx-starter/api-client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<ClientUserDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiAuthService: ApiAuthService,
    private router: Router,
  ) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.apiAuthService.getCurrentUser().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout(),
      });
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.apiAuthService.login({ email, password });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getUserRole(): string {
    return this.currentUserSubject.value?.role || '';
  }

  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.role === role;
  }
}
```

**NEVER make direct API calls for auth** - always use `AuthService`.

---

## Forms with Reactive Forms

### Basic Form with Validation

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiUserService } from '@ai-nx-starter/api-client';
import type { CreateUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule],
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="onSubmit()">
      <nz-form-item>
        <nz-form-label nzRequired>Email</nz-form-label>
        <nz-form-control [nzErrorTip]="emailErrorTip">
          <input nz-input formControlName="email" type="email" placeholder="user@example.com" />
          <ng-template #emailErrorTip let-control>
            <ng-container *ngIf="control.hasError('required')">Email is required</ng-container>
            <ng-container *ngIf="control.hasError('email')">Invalid email address</ng-container>
          </ng-template>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label nzRequired>First Name</nz-form-label>
        <nz-form-control [nzErrorTip]="firstNameErrorTip">
          <input nz-input formControlName="firstName" placeholder="John" />
          <ng-template #firstNameErrorTip let-control>
            <ng-container *ngIf="control.hasError('required')">First name is required</ng-container>
            <ng-container *ngIf="control.hasError('minlength')"> First name must be at least 2 characters </ng-container>
          </ng-template>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label nzRequired>Last Name</nz-form-label>
        <nz-form-control nzErrorTip="Last name is required">
          <input nz-input formControlName="lastName" placeholder="Doe" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label nzRequired>Password</nz-form-label>
        <nz-form-control [nzErrorTip]="passwordErrorTip">
          <input nz-input formControlName="password" type="password" placeholder="********" />
          <ng-template #passwordErrorTip let-control>
            <ng-container *ngIf="control.hasError('required')">Password is required</ng-container>
            <ng-container *ngIf="control.hasError('minlength')"> Password must be at least 8 characters </ng-container>
          </ng-template>
        </nz-form-control>
      </nz-form-item>

      <button nz-button nzType="primary" [nzLoading]="saving" [disabled]="!form.valid" type="submit">Create User</button>
    </form>
  `,
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private apiUserService: ApiUserService,
    private messageService: NzMessageService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    // Set default values if needed
    // this.form.patchValue({ firstName: 'John' });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      Object.values(this.form.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    const createDto: CreateUserDto = this.form.value;
    this.saving = true;

    this.apiUserService.create(createDto).subscribe({
      next: (user) => {
        this.messageService.success('User created successfully');
        this.form.reset();
        this.saving = false;
      },
      error: (err) => {
        this.messageService.error('Failed to create user');
        this.saving = false;
      },
    });
  }
}
```

### Custom Validators

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Password strength validator
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);

    const passwordValid = hasNumber && hasUpper && hasLower && hasSpecial;

    return !passwordValid ? { passwordStrength: true } : null;
  };
}

// Confirm password validator
export function confirmPasswordValidator(passwordField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null;
    }

    const password = control.parent.get(passwordField);
    const confirmPassword = control;

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    if (password.value === confirmPassword.value) {
      return null;
    }

    return { passwordMismatch: true };
  };
}

// Usage in form
this.form = this.fb.group({
  password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
  confirmPassword: ['', [Validators.required, confirmPasswordValidator('password')]],
});
```

---

## Modal/Dialog Pattern with NG-ZORRO

### Standard Modal Structure

```typescript
import { Component } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-user-list',
  template: `
    <button nz-button nzType="primary" (click)="showModal()">Open Modal</button>

    <nz-modal
      [(nzVisible)]="isModalVisible"
      nzTitle="Confirm Action"
      nzIconType="info-circle"
      [nzClosable]="true"
      (nzOnCancel)="handleCancel()"
      (nzOnOk)="handleOk()"
    >
      <ng-container *nzModalContent>
        <p>Are you sure you want to proceed with this action?</p>
        <p>This cannot be undone.</p>
      </ng-container>
    </nz-modal>
  `,
})
export class UserListComponent {
  isModalVisible = false;

  showModal(): void {
    this.isModalVisible = true;
  }

  handleOk(): void {
    console.log('Confirmed');
    this.isModalVisible = false;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }
}
```

### Modal Service Pattern

```typescript
import { Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserFormComponent } from '../components/user-form/user-form.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private modal: NzModalService) {}

  showConfirm(title: string, content: string, onOk: () => void): void {
    this.modal.confirm({
      nzTitle: title,
      nzContent: content,
      nzOnOk: () => onOk(),
    });
  }

  showUserForm(): void {
    this.modal.create({
      nzTitle: 'Create User',
      nzContent: UserFormComponent,
      nzFooter: null,
      nzWidth: 600,
    });
  }

  showDeleteConfirm(itemName: string, onDelete: () => void): void {
    this.modal.confirm({
      nzTitle: 'Delete Confirmation',
      nzContent: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: () => onDelete(),
    });
  }
}
```

---

## NG-ZORRO Table Patterns

### Basic Table with Pagination and Sorting

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ApiUserService } from '@ai-nx-starter/api-client';
import type { ClientUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule],
  template: `
    <nz-table
      #userTable
      [nzData]="users"
      [nzLoading]="loading"
      [nzPageSize]="25"
      [nzPageSizeOptions]="[10, 25, 50, 100]"
      [nzShowPagination]="true"
      [nzShowSizeChanger]="true"
      (nzQueryParams)="onQueryParamsChange($event)"
    >
      <thead>
        <tr>
          <th nzColumnKey="firstName" [nzSortFn]="true">First Name</th>
          <th nzColumnKey="lastName" [nzSortFn]="true">Last Name</th>
          <th nzColumnKey="email" [nzSortFn]="true">Email</th>
          <th>Role</th>
          <th nzWidth="150px">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of userTable.data; trackBy: trackByUserId">
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button nz-button nzType="link" nzSize="small" (click)="editUser(user)">Edit</button>
            <button nz-button nzType="link" nzSize="small" nzDanger (click)="deleteUser(user)">Delete</button>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `,
})
export class UserTableComponent implements OnInit {
  users: ClientUserDto[] = [];
  loading = false;

  constructor(private apiUserService: ApiUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.apiUserService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onQueryParamsChange(params: any): void {
    console.log('Query params changed:', params);
    // Handle pagination/sorting changes if using server-side pagination
  }

  editUser(user: ClientUserDto): void {
    console.log('Edit user:', user);
  }

  deleteUser(user: ClientUserDto): void {
    console.log('Delete user:', user);
  }

  trackByUserId(index: number, user: ClientUserDto): string {
    return user.id;
  }
}
```

### Table with Filters

```typescript
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-filtered-table',
  template: `
    <div class="table-header">
      <input nz-input [formControl]="searchControl" placeholder="Search users..." />
    </div>

    <nz-table [nzData]="filteredUsers" [nzLoading]="loading">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of filteredUsers; trackBy: trackByUserId">
          <td>{{ user.firstName }} {{ user.lastName }}</td>
          <td>{{ user.email }}</td>
        </tr>
      </tbody>
    </nz-table>
  `,
})
export class FilteredTableComponent implements OnInit {
  users: ClientUserDto[] = [];
  filteredUsers: ClientUserDto[] = [];
  loading = false;
  searchControl = new FormControl('');

  constructor(private apiUserService: ApiUserService) {}

  ngOnInit(): void {
    this.loadUsers();

    // Debounced search
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchTerm) => {
      this.filterUsers(searchTerm || '');
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.apiUserService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
    });
  }

  filterUsers(searchTerm: string): void {
    const term = searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }

  trackByUserId(index: number, user: ClientUserDto): string {
    return user.id;
  }
}
```

---

## Mutation Patterns with Auto-Generated API

### Update with Cache Invalidation

```typescript
import { Component } from '@angular/core';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { UserService } from '../services/user.service'; // BehaviorSubject cache service
import { NzMessageService } from 'ng-zorro-antd/message';
import type { UpdateUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-editor',
  template: ` <button nz-button nzType="primary" [nzLoading]="saving" (click)="saveUser()">Save</button> `,
})
export class UserEditorComponent {
  userId = '123';
  saving = false;

  constructor(
    private apiUserService: ApiUserService,
    private userService: UserService,
    private messageService: NzMessageService,
  ) {}

  saveUser(): void {
    const updateDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    this.saving = true;

    this.apiUserService.update(this.userId, updateDto).subscribe({
      next: (updatedUser) => {
        // Invalidate cache by reloading
        this.userService.loadUsers();

        this.messageService.success('User updated successfully');
        this.saving = false;
      },
      error: (err) => {
        this.messageService.error('Failed to update user');
        this.saving = false;
      },
    });
  }
}
```

### Delete with Confirmation

```typescript
import { Component } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  template: ` <button nz-button nzDanger (click)="confirmDelete(user.id)">Delete</button> `,
})
export class UserListComponent {
  constructor(
    private modal: NzModalService,
    private apiUserService: ApiUserService,
    private userService: UserService,
    private messageService: NzMessageService,
  ) {}

  confirmDelete(userId: string): void {
    this.modal.confirm({
      nzTitle: 'Delete User',
      nzContent: 'Are you sure you want to delete this user? This action cannot be undone.',
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: () => this.deleteUser(userId),
    });
  }

  deleteUser(userId: string): void {
    this.apiUserService.delete(userId).subscribe({
      next: () => {
        this.messageService.success('User deleted successfully');
        this.userService.loadUsers(); // Refresh cache
      },
      error: () => {
        this.messageService.error('Failed to delete user');
      },
    });
  }
}
```

---

## State Management Patterns

### BehaviorSubject Service for State (PRIMARY)

Use BehaviorSubject services for **all server data caching**:

```typescript
// apps/web-ui/src/app/features/users/services/user.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { NzMessageService } from 'ng-zorro-antd/message';
import type { ClientUserDto } from '@ai-nx-starter/types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersSubject = new BehaviorSubject<ClientUserDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private cacheTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  readonly users$ = this.usersSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  constructor(
    private apiUserService: ApiUserService,
    private messageService: NzMessageService,
  ) {}

  loadUsers(forceRefresh = false): void {
    const now = Date.now();
    const isCacheValid = now - this.cacheTime < this.CACHE_DURATION;

    if (!forceRefresh && isCacheValid && this.usersSubject.value.length > 0) {
      return; // Use cached data
    }

    this.loadingSubject.next(true);
    this.apiUserService
      .getUsers()
      .pipe(
        finalize(() => this.loadingSubject.next(false)),
        tap((users) => {
          this.usersSubject.next(users);
          this.cacheTime = Date.now();
        }),
        catchError((err) => {
          this.messageService.error('Failed to load users');
          return of([]);
        }),
      )
      .subscribe();
  }

  clearCache(): void {
    this.usersSubject.next([]);
    this.cacheTime = 0;
  }
}
```

### Component State (Local UI State)

Use component properties for **local UI state only**:

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <nz-tabset [(nzSelectedIndex)]="selectedTab">
      <nz-tab nzTitle="Active"></nz-tab>
      <nz-tab nzTitle="Inactive"></nz-tab>
    </nz-tabset>

    <nz-modal [(nzVisible)]="isModalVisible">
      <!-- Modal content -->
    </nz-modal>
  `,
})
export class UserListComponent {
  // ✅ CORRECT - Local UI state
  selectedTab = 0;
  isModalVisible = false;
}
```

### Global UI State Service (Minimal)

Use a service for **global UI state** only when needed:

```typescript
// apps/web-ui/src/app/core/services/ui-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(true);
  sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  toggleSidebar(): void {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.value);
  }

  setSidebarOpen(open: boolean): void {
    this.sidebarOpenSubject.next(open);
  }
}
```

**State Management Strategy:**

- ✅ BehaviorSubject services for server data (with caching)
- ✅ Component properties for local UI state
- ✅ Global UI service for shared UI state (minimal use)
- ❌ Avoid prop drilling - use services instead

---

## Summary

**Common Patterns:**

- ✅ AuthService for current user (currentUser$, login, logout, hasRole)
- ✅ Reactive Forms with built-in validators or custom validators
- ✅ NG-ZORRO Modal with confirm dialogs
- ✅ NG-ZORRO Table with pagination, sorting, filtering
- ✅ Mutations with auto-generated API client and cache invalidation
- ✅ BehaviorSubject services for server state (caching)
- ✅ Component properties for local UI state
- ✅ Global UI service for shared UI state (minimal)

**See Also:**

- [data-fetching-guide.md](data-fetching-guide.md) - BehaviorSubject patterns and caching
- [component-patterns-guide.md](component-patterns-guide.md) - Component structure
- [loading-and-error-states-guide.md](loading-and-error-states-guide.md) - Error handling with NzMessageService
