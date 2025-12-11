# Loading & Error States

**CRITICAL**: Proper loading and error state handling prevents layout shift and provides better user experience.

---

## ⚠️ CRITICAL RULE: Never Use Early Returns

### The Problem

```typescript
// ❌ NEVER DO THIS - Early return in ngOnInit
@Component({
  /* ... */
})
export class MyComponent implements OnInit {
  users: ClientUserDto[] = [];

  ngOnInit(): void {
    // WRONG: This approach doesn't even make sense in Angular
    // You can't "return" JSX from ngOnInit
    if (this.loading) {
      // Can't return template here!
      return;
    }
  }
}
```

**The Angular equivalent anti-pattern:**

```html
<!-- ❌ NEVER DO THIS - Conditional rendering that changes layout -->
<div *ngIf="loading">
  <nz-spin nzSimple></nz-spin>
  <!-- Just a spinner, different height than content! -->
</div>

<div *ngIf="!loading">
  <nz-table [nzData]="users">
    <!-- Full table, different height! -->
  </nz-table>
</div>
```

**Why this is bad:**

1. **Layout Shift**: Content position jumps when loading completes
2. **CLS (Cumulative Layout Shift)**: Poor Core Web Vital score
3. **Jarring UX**: Page structure changes suddenly
4. **Lost Scroll Position**: User loses place on page

### The Solutions

**Option 1: nz-spin with nzSpinning (PREFERRED for most cases)**

```html
<!-- ✅ CORRECT - Overlay preserves layout -->
<nz-spin [nzSpinning]="loading">
  <nz-table [nzData]="users">
    <!-- Table always rendered, loading overlay on top -->
  </nz-table>
</nz-spin>
```

**Option 2: nz-skeleton (for initial loading states)**

```html
<!-- ✅ CORRECT - Skeleton matches content structure -->
<div *ngIf="loading; else content">
  <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 4 }"></nz-skeleton>
</div>
<ng-template #content>
  <nz-card>
    <p>{{ data?.description }}</p>
  </nz-card>
</ng-template>
```

**Option 3: Template with \*ngIf and same container**

```html
<!-- ✅ CORRECT - Same container height preserved -->
<div class="content-container">
  <!-- Container has fixed/min height -->
  <nz-spin [nzSpinning]="loading" nzSimple *ngIf="loading"></nz-spin>
  <div *ngIf="!loading">
    <nz-table [nzData]="users"></nz-table>
  </div>
</div>
```

```less
// Component styles ensure consistent height
.content-container {
  min-height: 400px; // Prevents layout shift
  position: relative;
}
```

---

## nz-spin Component (Loading Overlay)

### What It Does

- Shows loading spinner overlay
- Prevents layout shift
- Optional transparent overlay
- Smooth fade-in animation

### Basic Usage

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <nz-spin [nzSpinning]="loading">
      <nz-table [nzData]="users">
        <!-- Table content -->
      </nz-table>
    </nz-spin>
  `,
})
export class UserListComponent implements OnInit {
  loading = false;
  users: ClientUserDto[] = [];

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

### With Custom Tip

```html
<nz-spin [nzSpinning]="loading" nzTip="Loading users...">
  <nz-table [nzData]="users">
    <!-- Table content -->
  </nz-table>
</nz-spin>
```

### Simple Spinner (No Overlay)

```html
<nz-spin [nzSpinning]="loading" nzSimple></nz-spin>
```

### Custom Size

```html
<nz-spin [nzSpinning]="loading" nzSize="large">
  <nz-card>
    <!-- Card content -->
  </nz-card>
</nz-spin>
```

**Available Sizes:**

- `small`
- `default`
- `large`

### Nested Spin

```html
<nz-spin [nzSpinning]="outerLoading">
  <div>
    <h2>Outer Content</h2>
    <nz-spin [nzSpinning]="innerLoading">
      <div>Inner Content</div>
    </nz-spin>
  </div>
</nz-spin>
```

---

## nz-skeleton Component (Skeleton Loading)

### When to Use

- Initial page load (before data arrives)
- Content structure preview
- Better perceived performance
- Smooth transition to real content

### Basic Usage

```typescript
@Component({
  selector: 'app-user-detail',
  template: `
    <div *ngIf="loading; else content">
      <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 4 }"></nz-skeleton>
    </div>
    <ng-template #content>
      <nz-card>
        <h2>{{ user?.name }}</h2>
        <p>{{ user?.email }}</p>
        <p>{{ user?.bio }}</p>
      </nz-card>
    </ng-template>
  `,
})
export class UserDetailComponent implements OnInit {
  loading = true;
  user: ClientUserDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiUserService: ApiUserService,
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id')!;
    this.apiUserService
      .getUser(userId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((user) => {
        this.user = user;
      });
  }
}
```

### Avatar Skeleton

```html
<nz-skeleton [nzActive]="true" [nzAvatar]="true" [nzParagraph]="{ rows: 3 }"></nz-skeleton>
```

### Custom Skeleton Layout

```html
<nz-skeleton [nzActive]="true" [nzTitle]="true" [nzAvatar]="avatarConfig" [nzParagraph]="paragraphConfig"></nz-skeleton>
```

```typescript
avatarConfig = { size: 'large', shape: 'circle' };
paragraphConfig = { rows: 4, width: ['100%', '100%', '80%', '60%'] };
```

### Loading List with Skeletons

```html
<div *ngIf="loading; else userList">
  <nz-card *ngFor="let item of [1, 2, 3, 4]">
    <nz-skeleton [nzActive]="true" [nzAvatar]="true" [nzParagraph]="{ rows: 2 }"></nz-skeleton>
  </nz-card>
</div>
<ng-template #userList>
  <nz-card *ngFor="let user of users">
    <div class="user-item">
      <img [src]="user.avatar" />
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
  </nz-card>
</ng-template>
```

---

## Error Handling

### NzMessageService (REQUIRED)

**Primary method for user feedback**

```typescript
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  /* ... */
})
export class UserFormComponent {
  constructor(
    private apiUserService: ApiUserService,
    private messageService: NzMessageService,
  ) {}

  createUser(createDto: CreateUserDto): void {
    this.apiUserService.create(createDto).subscribe({
      next: (user) => {
        this.messageService.success('User created successfully');
      },
      error: (err) => {
        this.messageService.error('Failed to create user');
      },
    });
  }
}
```

**Available Methods:**

- `success(message)` - Green success message
- `error(message)` - Red error message
- `warning(message)` - Orange warning message
- `info(message)` - Blue info message
- `loading(message)` - Loading message

### NzNotificationService (For Rich Content)

```typescript
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  /* ... */
})
export class UserComponent {
  constructor(private notificationService: NzNotificationService) {}

  showNotification(): void {
    this.notificationService.success('Success', 'User has been created successfully', {
      nzDuration: 4500,
    });
  }

  showErrorWithDetails(): void {
    this.notificationService.error('Error', 'Failed to create user. Please check the form and try again.', {
      nzDuration: 0, // Don't auto-close
    });
  }
}
```

### RxJS Error Handling with catchError

```typescript
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  /* ... */
})
export class UserListComponent implements OnInit {
  users: ClientUserDto[] = [];
  loading = false;

  constructor(
    private apiUserService: ApiUserService,
    private messageService: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.apiUserService
      .getUsers()
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.messageService.error('Failed to load users');
          console.error('Error loading users:', error);
          return of([]); // Return empty array on error
        }),
      )
      .subscribe((users) => {
        this.users = users;
      });
  }
}
```

### Global Error Handling with Interceptor

```typescript
// apps/web-ui/src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(NzMessageService);

  return next(req).pipe(
    catchError((error) => {
      // Handle different error types
      if (error.status === 401) {
        messageService.error('Unauthorized. Please log in.');
      } else if (error.status === 403) {
        messageService.error('Access denied.');
      } else if (error.status === 404) {
        messageService.error('Resource not found.');
      } else if (error.status === 500) {
        messageService.error('Server error. Please try again later.');
      } else {
        messageService.error('An error occurred. Please try again.');
      }

      return throwError(() => error);
    }),
  );
};
```

**Register Interceptor:**

```typescript
// main.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([errorInterceptor]))],
});
```

---

## Complete Examples

### Example 1: Modern Component with nz-spin

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, NzSpinModule, NzTableModule],
  template: `
    <div class="user-list-container">
      <h2>Users</h2>
      <nz-spin [nzSpinning]="loading" nzTip="Loading users...">
        <nz-table [nzData]="users">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
            </tr>
          </tbody>
        </nz-table>
      </nz-spin>
    </div>
  `,
  styleUrls: ['./user-list.component.less'],
})
export class UserListComponent implements OnInit {
  loading = false;
  users: ClientUserDto[] = [];

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

### Example 2: Skeleton Loading for Initial Load

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzCardModule } from 'ng-zorro-antd/card';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, NzSkeletonModule, NzCardModule],
  template: `
    <div class="user-detail-container">
      <div *ngIf="loading; else userContent">
        <nz-card>
          <nz-skeleton [nzActive]="true" [nzAvatar]="{ size: 'large', shape: 'circle' }" [nzParagraph]="{ rows: 4 }"></nz-skeleton>
        </nz-card>
      </div>
      <ng-template #userContent>
        <nz-card *ngIf="user">
          <div class="user-header">
            <img [src]="user.avatar" alt="Avatar" />
            <h2>{{ user.firstName }} {{ user.lastName }}</h2>
          </div>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Role:</strong> {{ user.role }}</p>
          <p><strong>Bio:</strong> {{ user.bio }}</p>
        </nz-card>
      </ng-template>
    </div>
  `,
  styleUrls: ['./user-detail.component.less'],
})
export class UserDetailComponent implements OnInit {
  loading = true;
  user: ClientUserDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiUserService: ApiUserService,
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id')!;
    this.apiUserService
      .getUser(userId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((user) => {
        this.user = user;
      });
  }
}
```

### Example 3: Error Handling with MessageService

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { CreateUserDto } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule],
  template: `
    <nz-card nzTitle="Create User">
      <form nz-form [formGroup]="form" (ngSubmit)="onSubmit()">
        <nz-form-item>
          <nz-form-label nzRequired>Email</nz-form-label>
          <nz-form-control nzErrorTip="Please enter a valid email">
            <input nz-input formControlName="email" type="email" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>First Name</nz-form-label>
          <nz-form-control nzErrorTip="Please enter first name">
            <input nz-input formControlName="firstName" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>Last Name</nz-form-label>
          <nz-form-control nzErrorTip="Please enter last name">
            <input nz-input formControlName="lastName" />
          </nz-form-control>
        </nz-form-item>

        <button nz-button nzType="primary" [nzLoading]="saving" [disabled]="!form.valid" type="submit">Create User</button>
      </form>
    </nz-card>
  `,
})
export class UserFormComponent {
  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private apiUserService: ApiUserService,
    private messageService: NzMessageService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    const createDto: CreateUserDto = this.form.value;
    this.saving = true;

    this.apiUserService
      .create(createDto)
      .pipe(
        finalize(() => (this.saving = false)),
        catchError((error) => {
          this.messageService.error('Failed to create user. Please try again.');
          console.error('Create user error:', error);
          return of(null);
        }),
      )
      .subscribe((user) => {
        if (user) {
          this.messageService.success('User created successfully');
          this.router.navigate(['/users', user.id]);
        }
      });
  }
}
```

### Example 4: Multiple Independent Loading States

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <nz-row [nzGutter]="16">
        <nz-col [nzSpan]="8">
          <nz-spin [nzSpinning]="loadingStats">
            <nz-card nzTitle="Statistics">
              <p>Total Users: {{ stats?.totalUsers }}</p>
              <p>Active Users: {{ stats?.activeUsers }}</p>
            </nz-card>
          </nz-spin>
        </nz-col>

        <nz-col [nzSpan]="8">
          <nz-spin [nzSpinning]="loadingActivity">
            <nz-card nzTitle="Recent Activity">
              <nz-list [nzDataSource]="activities" [nzRenderItem]="activityItem"></nz-list>
              <ng-template #activityItem let-item>
                <nz-list-item>{{ item.description }}</nz-list-item>
              </ng-template>
            </nz-card>
          </nz-spin>
        </nz-col>

        <nz-col [nzSpan]="8">
          <nz-spin [nzSpinning]="loadingAlerts">
            <nz-card nzTitle="Alerts">
              <nz-alert *ngFor="let alert of alerts" [nzType]="alert.type" [nzMessage]="alert.message"></nz-alert>
            </nz-card>
          </nz-spin>
        </nz-col>
      </nz-row>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  loadingStats = false;
  loadingActivity = false;
  loadingAlerts = false;

  stats: any = null;
  activities: any[] = [];
  alerts: any[] = [];

  constructor(
    private apiStatsService: ApiStatsService,
    private apiActivityService: ApiActivityService,
    private apiAlertsService: ApiAlertsService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadActivity();
    this.loadAlerts();
  }

  loadStats(): void {
    this.loadingStats = true;
    this.apiStatsService
      .getStats()
      .pipe(finalize(() => (this.loadingStats = false)))
      .subscribe((stats) => {
        this.stats = stats;
      });
  }

  loadActivity(): void {
    this.loadingActivity = true;
    this.apiActivityService
      .getRecentActivity()
      .pipe(finalize(() => (this.loadingActivity = false)))
      .subscribe((activities) => {
        this.activities = activities;
      });
  }

  loadAlerts(): void {
    this.loadingAlerts = true;
    this.apiAlertsService
      .getAlerts()
      .pipe(finalize(() => (this.loadingAlerts = false)))
      .subscribe((alerts) => {
        this.alerts = alerts;
      });
  }
}
```

---

## Loading State Anti-Patterns

### ❌ What NOT to Do

```html
<!-- ❌ NEVER - Early return equivalent (conditional with different layouts) -->
<div *ngIf="loading" class="loading-container">
  <nz-spin nzSimple></nz-spin>
  <!-- Only 100px height -->
</div>

<div *ngIf="!loading" class="content-container">
  <nz-table [nzData]="users">
    <!-- 500px height - LAYOUT SHIFT! -->
  </nz-table>
</div>

<!-- ❌ NEVER - No container height -->
<div>
  <nz-spin [nzSpinning]="loading" *ngIf="loading"></nz-spin>
  <nz-table [nzData]="users" *ngIf="!loading"></nz-table>
  <!-- Content jumps when loading completes -->
</div>
```

### ✅ What TO Do

```html
<!-- ✅ BEST - nz-spin with overlay -->
<nz-spin [nzSpinning]="loading">
  <nz-table [nzData]="users">
    <!-- Table always rendered, loading overlay on top -->
  </nz-table>
</nz-spin>

<!-- ✅ ACCEPTABLE - Skeleton with same layout -->
<div class="user-card-container">
  <!-- Container has min-height -->
  <div *ngIf="loading; else userCard">
    <nz-skeleton [nzActive]="true" [nzAvatar]="true" [nzParagraph]="{ rows: 3 }"></nz-skeleton>
  </div>
  <ng-template #userCard>
    <nz-card>
      <div class="user-info">
        <img [src]="user?.avatar" />
        <h3>{{ user?.name }}</h3>
        <p>{{ user?.bio }}</p>
      </div>
    </nz-card>
  </ng-template>
</div>

<!-- ✅ OK - Fixed height container -->
<div class="fixed-height-container">
  <nz-spin [nzSpinning]="loading" nzSimple *ngIf="loading"></nz-spin>
  <div *ngIf="!loading">
    <nz-table [nzData]="users"></nz-table>
  </div>
</div>
```

```less
// Ensure consistent height
.user-card-container {
  min-height: 300px;
}

.fixed-height-container {
  height: 500px;
  position: relative;
}
```

---

## Summary

**Loading States:**

- ✅ **PREFERRED**: `nz-spin` with `[nzSpinning]` (overlay pattern)
- ✅ **ACCEPTABLE**: `nz-skeleton` for initial loads (matches content structure)
- ✅ **OK**: `*ngIf` with fixed container height
- ❌ **NEVER**: Conditional rendering that changes layout height

**Error Handling:**

- ✅ **ALWAYS**: `NzMessageService` for user feedback
- ✅ **RICH CONTENT**: `NzNotificationService` for detailed messages
- ✅ Use RxJS `catchError` for error handling
- ✅ Use HTTP interceptors for global error handling
- ✅ `finalize` operator for cleanup (works on both success and error)

**Key Principles:**

1. Prevent layout shift at all costs
2. Use loading overlays (`nz-spin`) when possible
3. Skeleton loading should match final content structure
4. Always provide user feedback for errors
5. Handle errors gracefully with fallback values

**See Also:**

- [component-patterns-guide.md](component-patterns-guide.md) - Loading state integration
- [data-fetching-guide.md](data-fetching-guide.md) - RxJS error handling patterns
- [styling-guide.md](styling-guide.md) - Fixed height containers
