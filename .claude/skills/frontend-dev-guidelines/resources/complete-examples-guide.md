# Complete Examples

Full working examples combining all modern Angular patterns: Components with OnPush, lazy loading, RxJS, auto-generated API client, NG-ZORRO, LESS styling, routing, and error handling.

---

## Example 1: Complete Modern Component

Combines: @Component, OnPush, BehaviorSubject service, auto-generated API, LESS styling, NzMessageService

### Component TypeScript

```typescript
// apps/web-ui/src/app/features/users/components/user-profile/user-profile.component.ts
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';
import { ApiUserService } from '@ai-nx-starter/api-client';
import type { ClientUserDto, UpdateUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzAvatarModule, NzSpinModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
  /** The user ID to load and display */
  @Input() userId!: string;

  /** Emitted when user profile is updated */
  @Output() update = new EventEmitter<void>();

  user: ClientUserDto | null = null;
  loading = false;
  saving = false;
  isEditing = false;

  constructor(
    private apiUserService: ApiUserService,
    private messageService: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.loading = true;
    this.apiUserService
      .getUser(this.userId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (user) => {
          this.user = user;
        },
        error: () => {
          this.messageService.error('Failed to load user profile');
        },
      });
  }

  get fullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  handleEdit(): void {
    this.isEditing = true;
  }

  handleSave(): void {
    if (!this.user) return;

    const updateDto: UpdateUserDto = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
    };

    this.saving = true;
    this.apiUserService
      .update(this.userId, updateDto)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.messageService.success('Profile updated successfully');
          this.isEditing = false;
          this.update.emit();
        },
        error: () => {
          this.messageService.error('Failed to update profile');
        },
      });
  }

  handleCancel(): void {
    this.isEditing = false;
    this.loadUser(); // Reload to revert changes
  }
}
```

### Component Template

```html
<!-- apps/web-ui/src/app/features/users/components/user-profile/user-profile.component.html -->
<!-- ✅ CORRECT - nz-spin wrapper prevents layout shift, card always renders -->
<nz-spin [nzSpinning]="loading">
  <nz-card class="profile-container">
    <ng-container *ngIf="user">
      <div class="profile-header">
        <nz-avatar [nzSize]="64" nzIcon="user"> {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }} </nz-avatar>
        <div class="profile-info">
          <h2>{{ fullName }}</h2>
          <p class="email">{{ user.email }}</p>
        </div>
      </div>

      <div class="profile-content">
        <div class="info-row">
          <span class="label">Role:</span>
          <span class="value">{{ user.role }}</span>
        </div>
        <div class="info-row">
          <span class="label">Created:</span>
          <span class="value">{{ user.createdAt | date: 'medium' }}</span>
        </div>
      </div>

      <div class="profile-actions">
        <ng-container *ngIf="!isEditing; else editingActions">
          <button nz-button nzType="primary" (click)="handleEdit()">Edit Profile</button>
        </ng-container>
        <ng-template #editingActions>
          <button nz-button nzType="primary" [nzLoading]="saving" [disabled]="saving" (click)="handleSave()">Save</button>
          <button nz-button (click)="handleCancel()">Cancel</button>
        </ng-template>
      </div>
    </ng-container>
  </nz-card>
</nz-spin>
```

### Component Styles

```less
// apps/web-ui/src/app/features/users/components/user-profile/user-profile.component.less
.profile-container {
  max-width: 600px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: @padding-md;
  margin-bottom: @padding-lg;

  .profile-info {
    h2 {
      color: @heading-color;
      margin: 0;
      font-size: @font-size-lg;
    }

    .email {
      color: @text-color-secondary;
      margin: 0;
    }
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: @padding-sm;

  .info-row {
    display: flex;
    gap: @padding-xs;

    .label {
      font-weight: 600;
      color: @text-color;
    }

    .value {
      color: @text-color-secondary;
    }
  }
}

.profile-actions {
  display: flex;
  gap: @padding-sm;
  margin-top: @padding-lg;
}
```

### Usage

```typescript
// In parent component
<app-user-profile [userId]="'123'" (update)="handleUserUpdate()"></app-user-profile>
```

---

## Example 2: Complete Feature Structure

A full feature module with routing, services, guards, and components.

### Feature Structure

```
features/
  users/
    components/
      user-list/
        user-list.component.ts
        user-list.component.html
        user-list.component.less
      user-detail/
        user-detail.component.ts
        user-detail.component.html
        user-detail.component.less
      user-form/
        user-form.component.ts
        user-form.component.html
        user-form.component.less
    services/
      user.service.ts            # BehaviorSubject cache service
    guards/
      user-auth.guard.ts
    models/
      user-filters.model.ts
    user-routing.module.ts
    index.ts
```

### Service Layer (BehaviorSubject Caching)

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
  private selectedUserSubject = new BehaviorSubject<ClientUserDto | null>(null);
  private cacheTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  readonly users$ = this.usersSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly selectedUser$ = this.selectedUserSubject.asObservable();

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

  loadUser(userId: string): void {
    this.apiUserService.getUser(userId).subscribe({
      next: (user) => {
        this.selectedUserSubject.next(user);
        // Update user in list if exists (immutable update)
        const users = this.usersSubject.value;
        const index = users.findIndex((u) => u.id === userId);
        if (index !== -1) {
          const updatedUsers = [...users];
          updatedUsers[index] = user;
          this.usersSubject.next(updatedUsers);
        }
      },
      error: () => {
        this.messageService.error('Failed to load user');
      },
    });
  }

  clearCache(): void {
    this.usersSubject.next([]);
    this.selectedUserSubject.next(null);
    this.cacheTime = 0;
  }
}
```

### Route Configuration

```typescript
// apps/web-ui/src/app/features/users/user-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/user-list/user-list.component').then((m) => m.UserListComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Users' },
  },
  {
    path: 'create',
    loadComponent: () => import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Create User' },
  },
  {
    path: ':id',
    loadComponent: () => import('./components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'User Detail' },
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Edit User' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
```

### Route Guard

```typescript
// apps/web-ui/src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
```

---

## Example 3: Form with Reactive Validation

Complete form with validation, API integration, and error handling.

```typescript
// apps/web-ui/src/app/features/users/components/user-form/user-form.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { UserService } from '../../services/user.service';
import type { CreateUserDto, UpdateUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzSelectModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  saving = false;
  isEditMode = false;
  userId: string | null = null;

  roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'superadmin' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiUserService: ApiUserService,
    private userService: UserService,
    private messageService: NzMessageService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      role: ['user', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    // Check if editing existing user
    this.route.params
      .pipe(
        switchMap((params) => {
          this.userId = params['id'];
          if (this.userId) {
            this.isEditMode = true;
            return this.apiUserService.getUser(this.userId);
          }
          return of(null);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((user) => {
        if (user) {
          this.form.patchValue(user);
          // Remove password requirement for update
          this.form.get('password')?.clearValidators();
          this.form.get('password')?.updateValueAndValidity();
        }
      });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      Object.values(this.form.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.saving = true;

    if (this.isEditMode && this.userId) {
      // Update existing user
      const updateDto: UpdateUserDto = this.form.value;
      this.apiUserService
        .update(this.userId, updateDto)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: () => {
            this.messageService.success('User updated successfully');
            this.userService.clearCache();
            this.router.navigate(['/users', this.userId]);
          },
          error: () => {
            this.messageService.error('Failed to update user');
          },
        });
    } else {
      // Create new user
      const createDto: CreateUserDto = this.form.value;
      this.apiUserService
        .create(createDto)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: (user) => {
            this.messageService.success('User created successfully');
            this.userService.clearCache();
            this.router.navigate(['/users', user.id]);
          },
          error: () => {
            this.messageService.error('Failed to create user');
          },
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
```

---

## Example 4: List Component with Filtering

Complete list component with NG-ZORRO table, filtering, and pagination.

```typescript
// apps/web-ui/src/app/features/users/components/user-list/user-list.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { UserService } from '../../services/user.service';
import type { ClientUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzTableModule, NzInputModule, NzButtonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit, OnDestroy {
  users: ClientUserDto[] = [];
  filteredUsers: ClientUserDto[] = [];
  loading = false;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private apiUserService: ApiUserService,
    private userService: UserService,
    private modal: NzModalService,
    private messageService: NzMessageService,
  ) {}

  ngOnInit(): void {
    // Subscribe to cached users
    this.userService.users$.pipe(takeUntil(this.destroy$)).subscribe((users) => {
      this.users = users;
      this.filteredUsers = users;
    });

    this.userService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.loading = loading;
    });

    // Load users
    this.userService.loadUsers();

    // Setup search debouncing
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((searchTerm) => {
      this.filterUsers(searchTerm || '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  createUser(): void {
    this.router.navigate(['/users/create']);
  }

  editUser(user: ClientUserDto): void {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  viewUser(user: ClientUserDto): void {
    this.router.navigate(['/users', user.id]);
  }

  deleteUser(user: ClientUserDto): void {
    this.modal.confirm({
      nzTitle: 'Delete User',
      nzContent: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: () => {
        this.apiUserService.delete(user.id).subscribe({
          next: () => {
            this.messageService.success('User deleted successfully');
            this.userService.loadUsers(true); // Force refresh
          },
          error: () => {
            this.messageService.error('Failed to delete user');
          },
        });
      },
    });
  }

  trackByUserId(index: number, user: ClientUserDto): string {
    return user.id;
  }
}
```

---

## Summary

**Complete Example Patterns:**

- ✅ Modern component with OnPush, RxJS, auto-generated API client
- ✅ Feature structure with routing, services, guards
- ✅ BehaviorSubject service for caching and state management
- ✅ Reactive forms with validation and API integration
- ✅ List component with filtering, sorting, pagination
- ✅ LESS styling with theme variables
- ✅ Error handling with NzMessageService
- ✅ Route guards for authentication
- ✅ Lazy loading for code splitting

**See Also:**

- [component-patterns-guide.md](component-patterns-guide.md) - Component patterns in detail
- [data-fetching-guide.md](data-fetching-guide.md) - BehaviorSubject and RxJS patterns
- [routing-guide.md](routing-guide.md) - Routing and guards
- [common-patterns-guide.md](common-patterns-guide.md) - Forms, modals, tables
