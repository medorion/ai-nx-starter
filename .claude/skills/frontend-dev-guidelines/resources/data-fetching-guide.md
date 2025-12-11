# Data Fetching Patterns

Modern data fetching using auto-generated API clients, RxJS Observables, and service-based caching strategies.

---

## PRIMARY PATTERN: Auto-Generated API Client

### Why Auto-Generated API Client?

For **all data fetching**, use the auto-generated API client from `@ai-nx-starter/api-client`:

**Benefits:**

- Type-safe API calls matching backend contracts
- Automatic updates when backend changes
- Consistent error handling
- No manual HTTP service creation
- Eliminates API contract drift

### Basic Pattern

```typescript
import { Component, OnInit } from '@angular/core';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto } from '@ai-nx-starter/types';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  users: ClientUserDto[] = [];
  loading = false;

  constructor(private apiUserService: ApiUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.apiUserService
      .getUsers()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((users) => {
        this.users = users;
      });
  }
}
```

**Template:**

```html
<nz-spin [nzSpinning]="loading">
  <nz-table [nzData]="users">
    <!-- table content -->
  </nz-table>
</nz-spin>
```

### API Client vs Manual HTTP

| Feature         | Auto-Generated API Client          | Manual HttpClient       |
| --------------- | ---------------------------------- | ----------------------- |
| Type safety     | Full type safety from backend DTOs | Manual type definitions |
| Maintenance     | Auto-updates with backend changes  | Manual updates required |
| Error handling  | Consistent across all endpoints    | Custom per endpoint     |
| Use with        | **ALL new components**             | Legacy code only        |
| Contract sync   | Always matches backend             | Can drift out of sync   |
| Recommended for | **ALL data fetching**              | NEVER (except legacy)   |

**For new components: Always use auto-generated API client**

---

## Cache-First Strategy with Services

### Service Layer Pattern

**Smart caching** reduces API calls by maintaining state in services:

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto } from '@ai-nx-starter/types';
import { MessageService } from '@/app/core/services/message.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  // Private state
  private readonly _users$ = new BehaviorSubject<ClientUserDto[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private cacheTime: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Public observables
  readonly users$ = this._users$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  // Synchronous getters
  get users(): ClientUserDto[] {
    return this._users$.value;
  }

  get loading(): boolean {
    return this._loading$.value;
  }

  constructor(
    private apiUserService: ApiUserService,
    private messageService: MessageService,
  ) {}

  /**
   * Load users with cache-first strategy
   */
  loadUsers(forceRefresh = false): void {
    const now = Date.now();

    // Check cache freshness
    if (!forceRefresh && this.cacheTime && now - this.cacheTime < this.CACHE_DURATION) {
      return; // Use cached data
    }

    this._loading$.next(true);

    this.apiUserService
      .getUsers()
      .pipe(
        finalize(() => this._loading$.next(false)),
        tap((users) => {
          this._users$.next(users);
          this.cacheTime = Date.now();
        }),
        catchError((err) => {
          this.messageService.error('Failed to load users');
          return of([]);
        }),
      )
      .subscribe();
  }

  /**
   * Get single user (check cache first)
   */
  getUser(userId: string): Observable<ClientUserDto | undefined> {
    // Try cache first
    const cached = this._users$.value.find((u) => u.id === userId);
    if (cached) {
      return of(cached);
    }

    // Fetch from API
    return this.apiUserService.getUser(userId).pipe(
      tap((user) => {
        // Update cache
        const current = this._users$.value;
        this._users$.next([...current, user]);
      }),
      catchError((err) => {
        this.messageService.error('Failed to load user');
        return of(undefined);
      }),
    );
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this._users$.next([]);
    this.cacheTime = null;
  }
}
```

**Component Usage:**

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <nz-spin [nzSpinning]="usersService.loading$ | async">
      <nz-table [nzData]="usersService.users$ | async">
        <!-- table content -->
      </nz-table>
    </nz-spin>
  `,
})
export class UserListComponent implements OnInit {
  constructor(public usersService: UsersService) {}

  ngOnInit(): void {
    this.usersService.loadUsers();
  }

  refresh(): void {
    this.usersService.loadUsers(true); // Force refresh
  }
}
```

**Key Points:**

- BehaviorSubject maintains state
- Cache expiration with timestamp
- Check cache before API call
- Expose both Observable and synchronous getters

---

## Parallel Data Fetching

### Using forkJoin

When fetching multiple independent resources:

```typescript
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: StatsDto | null = null;
  projects: ProjectDto[] = [];
  notifications: NotificationDto[] = [];
  loading = false;

  constructor(
    private apiStatsService: ApiStatsService,
    private apiProjectService: ApiProjectService,
    private apiNotificationService: ApiNotificationService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      stats: this.apiStatsService.getStats(),
      projects: this.apiProjectService.getActiveProjects(),
      notifications: this.apiNotificationService.getUnread(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ stats, projects, notifications }) => {
          this.stats = stats;
          this.projects = projects;
          this.notifications = notifications;
        },
        error: (err) => {
          this.messageService.error('Failed to load dashboard data');
        },
      });
  }
}
```

**Benefits:**

- All queries execute in parallel
- Single loading state
- Type-safe results
- Waits for all to complete

### Using combineLatest

When you want to react to changes in multiple observables:

```typescript
import { combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  /* ... */
})
export class FilteredListComponent implements OnInit, OnDestroy {
  filteredUsers: ClientUserDto[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private usersService: UsersService,
    private filterService: FilterService,
  ) {}

  ngOnInit(): void {
    combineLatest([this.usersService.users$, this.filterService.filter$])
      .pipe(
        map(([users, filter]) => this.applyFilter(users, filter)),
        takeUntil(this.destroy$),
      )
      .subscribe((filtered) => {
        this.filteredUsers = filtered;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyFilter(users: ClientUserDto[], filter: Filter): ClientUserDto[] {
    // Apply filter logic
    return users.filter((u) => u.name.includes(filter.search));
  }
}
```

---

## API Route Format Rules (IMPORTANT)

### Correct Format

The auto-generated API client handles routing automatically. You don't specify routes manually:

```typescript
// ✅ CORRECT - Use generated methods
this.apiUserService.getUsers().subscribe(/* ... */);
this.apiUserService.getUser(userId).subscribe(/* ... */);
this.apiPostService.getPosts(blogId).subscribe(/* ... */);

// ❌ WRONG - Don't create manual HTTP calls
this.http.get('/api/users').subscribe(/* ... */); // WRONG!
this.http.post('/users/create', data).subscribe(/* ... */); // WRONG!
```

**Why:** API client methods are generated from backend controllers. Routes are already correct.

---

## Error Handling

### Basic Error Handling

```typescript
import { catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

loadUsers(): void {
  this.loading = true;
  this.apiUserService
    .getUsers()
    .pipe(
      finalize(() => (this.loading = false)),
      catchError((err) => {
        // User feedback
        this.messageService.error('Failed to load users');

        // Log for debugging
        this.logger.error('Load users failed', err);

        // Return fallback value or rethrow
        return of([]); // Return empty array
        // OR
        // return throwError(() => err); // Rethrow
      })
    )
    .subscribe((users) => {
      this.users = users;
    });
}
```

### Global Error Handling

The global HTTP interceptor handles errors automatically:

```typescript
// apps/web-ui/src/app/core/interceptors/global-http.interceptor.ts
// Already configured - handles auth errors, network errors, etc.
```

### Custom Error Handling Per Call

```typescript
this.apiUserService
  .getUser(userId)
  .pipe(
    catchError((err) => {
      if (err.status === 404) {
        this.messageService.error('User not found');
        this.router.navigate(['/users']);
      } else if (err.status === 403) {
        this.messageService.error('Access denied');
      } else {
        this.messageService.error('An error occurred');
      }
      return throwError(() => err);
    }),
  )
  .subscribe(/* ... */);
```

---

## Mutations (Create, Update, Delete)

### Create Pattern

```typescript
@Component({
  /* ... */
})
export class UserFormComponent {
  saving = false;

  constructor(
    private apiUserService: ApiUserService,
    private usersService: UsersService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  createUser(createDto: CreateUserDto): void {
    this.saving = true;

    this.apiUserService
      .create(createDto)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (user) => {
          this.messageService.success('User created successfully');

          // Invalidate cache (force reload)
          this.usersService.clearCache();
          this.usersService.loadUsers(true);

          // Navigate to list
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.messageService.error('Failed to create user');
        },
      });
  }
}
```

### Update Pattern

```typescript
updateUser(userId: string, updateDto: UpdateUserDto): void {
  this.saving = true;

  this.apiUserService
    .update(userId, updateDto)
    .pipe(finalize(() => (this.saving = false)))
    .subscribe({
      next: (updatedUser) => {
        this.messageService.success('User updated successfully');

        // Update service cache
        this.usersService.clearCache();
        this.usersService.loadUsers(true);

        // Or update locally (optimistic)
        const current = this.usersService.users;
        const index = current.findIndex((u) => u.id === userId);
        if (index !== -1) {
          current[index] = updatedUser;
          this.usersService['_users$'].next([...current]);
        }
      },
      error: (err) => {
        this.messageService.error('Failed to update user');
      },
    });
}
```

### Delete Pattern

```typescript
deleteUser(userId: string): void {
  this.deleting = true;

  this.apiUserService
    .delete(userId)
    .pipe(finalize(() => (this.deleting = false)))
    .subscribe({
      next: () => {
        this.messageService.success('User deleted successfully');

        // Optimistic update - remove from cache immediately
        const current = this.usersService.users;
        const filtered = current.filter((u) => u.id !== userId);
        this.usersService['_users$'].next(filtered);
      },
      error: (err) => {
        this.messageService.error('Failed to delete user');

        // Rollback - refetch to get accurate state
        this.usersService.loadUsers(true);
      },
    });
}
```

### Optimistic Updates with Rollback

```typescript
updateUser(userId: string, updateDto: UpdateUserDto): void {
  // 1. Save current state for rollback
  const previousUsers = this.usersService.users;

  // 2. Optimistically update UI
  const index = previousUsers.findIndex((u) => u.id === userId);
  if (index !== -1) {
    const optimisticUsers = [...previousUsers];
    optimisticUsers[index] = { ...optimisticUsers[index], ...updateDto };
    this.usersService['_users$'].next(optimisticUsers);
  }

  // 3. Make API call
  this.apiUserService.update(userId, updateDto).subscribe({
    next: (updatedUser) => {
      // Success - update with server response
      const current = this.usersService.users;
      const idx = current.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        current[idx] = updatedUser;
        this.usersService['_users$'].next([...current]);
      }
      this.messageService.success('User updated');
    },
    error: (err) => {
      // Error - rollback to previous state
      this.usersService['_users$'].next(previousUsers);
      this.messageService.error('Update failed');
    },
  });
}
```

---

## Advanced Patterns

### Polling

```typescript
import { interval } from 'rxjs';
import { switchMap, startWith, takeUntil } from 'rxjs/operators';

@Component({
  /* ... */
})
export class LiveDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Poll every 5 seconds
    interval(5000)
      .pipe(
        startWith(0), // Fetch immediately
        switchMap(() => this.apiStatsService.getStats()),
        takeUntil(this.destroy$),
      )
      .subscribe((stats) => {
        this.stats = stats;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Debounced Search

```typescript
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  /* ... */
})
export class UserSearchComponent implements OnInit {
  searchTerm$ = new Subject<string>();
  results: ClientUserDto[] = [];

  ngOnInit(): void {
    this.searchTerm$
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only if search term changed
        switchMap((term) => this.apiUserService.search(term)),
      )
      .subscribe((results) => {
        this.results = results;
      });
  }

  onSearchChange(term: string): void {
    this.searchTerm$.next(term);
  }
}
```

### Dependent Sequential Calls

```typescript
loadUserAndSettings(userId: string): void {
  this.apiUserService
    .getUser(userId)
    .pipe(
      switchMap((user) => {
        // Use user data to fetch settings
        return this.apiSettingsService.getUserSettings(user.id).pipe(
          map((settings) => ({ user, settings }))
        );
      })
    )
    .subscribe(({ user, settings }) => {
      this.user = user;
      this.settings = settings;
    });
}
```

---

## Complete Examples

### Example 1: Simple List Component

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto } from '@ai-nx-starter/types';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzSpinModule],
  template: `
    <nz-spin [nzSpinning]="loading">
      <nz-table [nzData]="users">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
          </tr>
        </tbody>
      </nz-table>
    </nz-spin>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  users: ClientUserDto[] = [];
  loading = false;

  constructor(private apiUserService: ApiUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.apiUserService
      .getUsers()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((users) => {
        this.users = users;
      });
  }
}
```

### Example 2: Service with Cache

```typescript
// users.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap, finalize, catchError } from 'rxjs/operators';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto } from '@ai-nx-starter/types';
import { MessageService } from '@/app/core/services/message.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly _users$ = new BehaviorSubject<ClientUserDto[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  readonly users$ = this._users$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  constructor(
    private apiUserService: ApiUserService,
    private messageService: MessageService,
  ) {}

  loadUsers(): void {
    this._loading$.next(true);

    this.apiUserService
      .getUsers()
      .pipe(
        finalize(() => this._loading$.next(false)),
        tap((users) => this._users$.next(users)),
        catchError((err) => {
          this.messageService.error('Failed to load users');
          throw err;
        }),
      )
      .subscribe();
  }

  addUser(user: ClientUserDto): void {
    const current = this._users$.value;
    this._users$.next([...current, user]);
  }

  removeUser(userId: string): void {
    const current = this._users$.value;
    this._users$.next(current.filter((u) => u.id !== userId));
  }
}

// Component usage
@Component({
  template: `
    <nz-spin [nzSpinning]="usersService.loading$ | async">
      <div *ngFor="let user of usersService.users$ | async">
        {{ user.name }}
      </div>
    </nz-spin>
  `,
})
export class UserListComponent implements OnInit {
  constructor(public usersService: UsersService) {}

  ngOnInit(): void {
    this.usersService.loadUsers();
  }
}
```

### Example 3: Form with Create/Update

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { CreateUserDto, UpdateUserDto } from '@ai-nx-starter/types';
import { finalize, switchMap } from 'rxjs/operators';
import { MessageService } from '@/app/core/services/message.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  saving = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiUserService: ApiUserService,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.userId = params['id'];
          if (this.userId) {
            return this.apiUserService.getUser(this.userId);
          }
          return of(null);
        }),
      )
      .subscribe((user) => {
        if (user) {
          this.form.patchValue(user);
          // Remove password requirement for update
          this.form.get('password')?.clearValidators();
        }
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.messageService.error('Please fix form errors');
      return;
    }

    this.saving = true;

    if (this.userId) {
      // Update existing
      const updateDto: UpdateUserDto = this.form.value;
      this.apiUserService
        .update(this.userId, updateDto)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: () => {
            this.messageService.success('User updated');
            this.router.navigate(['/users']);
          },
          error: () => {
            this.messageService.error('Update failed');
          },
        });
    } else {
      // Create new
      const createDto: CreateUserDto = this.form.value;
      this.apiUserService
        .create(createDto)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: () => {
            this.messageService.success('User created');
            this.router.navigate(['/users']);
          },
          error: () => {
            this.messageService.error('Creation failed');
          },
        });
    }
  }
}
```

---

## Summary

**Modern Angular Data Fetching Recipe:**

1. **Use Auto-Generated API Client**: Always use `@ai-nx-starter/api-client` services
2. **Service Layer for State**: Create services with BehaviorSubject for caching
3. **RxJS Operators**: Use `finalize`, `catchError`, `tap`, `switchMap`
4. **Template Loading**: Use `*ngIf` with `nz-spin` for loading states
5. **Error Handling**: Use `MessageService` for user feedback
6. **Type Safety**: Import DTOs from `@ai-nx-starter/types`
7. **Subscription Cleanup**: Use `takeUntil` pattern or `async` pipe
8. **Cache Invalidation**: Clear cache after mutations

**See Also:**

- [component-patterns-guide.md](component-patterns-guide.md) - Component structure
- [file-organization-guide.md](file-organization-guide.md) - Service layer organization
- [loading-and-error-states-guide.md](loading-and-error-states-guide.md) - Error handling with NzMessageService
