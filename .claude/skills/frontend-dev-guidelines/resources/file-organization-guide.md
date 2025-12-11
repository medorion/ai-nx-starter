# File Organization

Proper file and directory structure for maintainable, scalable Angular frontend code in the Nx monorepo.

---

## features/ vs components/ Distinction

### features/ Directory

**Purpose**: Domain-specific features with their own logic, API, and components

**When to use:**

- Feature has multiple related components
- Feature has its own API endpoints (via auto-generated `@ai-nx-starter/api-client`)
- Feature has domain-specific logic
- Feature has custom services/state management

**Examples:**

- `features/users/` - User management
- `features/teams/` - Team management
- `features/auth/` - Authentication flows

**Structure:**

```
features/
  my-feature/
    components/
      my-feature-list/
        my-feature-list.component.ts
        my-feature-list.component.html
        my-feature-list.component.less
        my-feature-list.component.spec.ts
      my-feature-detail/
        my-feature-detail.component.ts
        my-feature-detail.component.html
        my-feature-detail.component.less
    services/
      my-feature.service.ts           # State management with BehaviorSubject
      my-feature.service.spec.ts
    models/
      my-feature.model.ts               # Frontend-specific models/interfaces
    guards/
      my-feature.guard.ts               # Route guards
    directives/
      my-feature.directive.ts           # Custom directives
    my-feature-routing.module.ts        # Feature routing (if using modules)
    index.ts                            # Public exports
```

### components/ Directory

**Purpose**: Truly reusable components used across multiple features

**When to use:**

- Component is used in 3+ places
- Component is generic (no feature-specific logic)
- Component is a UI primitive or pattern

**Examples:**

- `components/loader/` - Loading wrapper
- `components/header/` - Application header
- `components/error-boundary/` - Error handling
- `components/loading-overlay/` - Loading overlay

**Structure:**

```
components/
  loader/
    loader.component.ts
    loader.component.html
    loader.component.less
    loader.component.spec.ts
  header/
    header.component.ts
    header.component.html
    header.component.less
    header.component.spec.ts
```

---

## Feature Directory Structure (Detailed)

### Complete Feature Example

Based on `features/users/` structure:

```
features/
  users/
    components/
      user-list/
        user-list.component.ts        # Main container component
        user-list.component.html
        user-list.component.less
        user-list.component.spec.ts
      user-detail/
        user-detail.component.ts
        user-detail.component.html
        user-detail.component.less
        user-detail.component.spec.ts
      user-form/
        user-form.component.ts        # Shared form component
        user-form.component.html
        user-form.component.less

    services/
      user.service.ts                 # State management with BehaviorSubject
      user.service.spec.ts

    models/
      user.model.ts                   # Frontend-specific interfaces/types
      user-filters.model.ts

    guards/
      user-auth.guard.ts              # Route guards
      user-auth.guard.spec.ts

    directives/
      user-highlight.directive.ts     # Custom directives (if needed)

    pipes/
      user-name.pipe.ts               # Custom pipes (if needed)

    user-routing.module.ts            # Feature routing (if using modules)
    index.ts                          # Public API exports
```

### Subdirectory Guidelines

#### components/ Directory

**Purpose**: Feature-specific components

**Organization:**

- Each component in its own directory
- Include .ts, .html, .less, and .spec.ts files
- Use kebab-case for directory and file names

**Examples:**

```
components/
  user-list/
    user-list.component.ts
    user-list.component.html
    user-list.component.less
    user-list.component.spec.ts
  user-detail/
    user-detail.component.ts
    user-detail.component.html
    user-detail.component.less
    user-detail.component.spec.ts
```

#### services/ Directory

**Purpose**: State management, caching, and business logic for the feature

**Naming:**

- `{feature}.service.ts` pattern
- Descriptive of what they do

**Examples:**

```
services/
  user.service.ts                     # Main service with BehaviorSubject state
  user.service.spec.ts
  user-cache.service.ts               # Caching service (if complex)
```

**Pattern:**

```typescript
// services/user.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto } from '@ai-nx-starter/types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersSubject = new BehaviorSubject<ClientUserDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  users$ = this.usersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private apiUserService: ApiUserService) {}

  loadUsers(): void {
    this.loadingSubject.next(true);
    this.apiUserService
      .getUsers()
      .pipe(
        tap((users) => this.usersSubject.next(users)),
        finalize(() => this.loadingSubject.next(false)),
      )
      .subscribe();
  }
}
```

#### models/ Directory

**Purpose**: Frontend-specific TypeScript types and interfaces

**Note**: Shared DTOs with backend are in `@ai-nx-starter/types` package

**Files:**

```
models/
  user.model.ts                       # Frontend-specific types
  user-filters.model.ts               # Filter/search interfaces
  user-state.model.ts                 # State management types
```

**Pattern:**

```typescript
// models/user.model.ts
import { ClientUserDto } from '@ai-nx-starter/types';

export interface UserListState {
  users: ClientUserDto[];
  loading: boolean;
  error: string | null;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
}
```

#### guards/ Directory

**Purpose**: Route guards for authentication and authorization

**Examples:**

```
guards/
  user-auth.guard.ts                  # Authentication guard
  user-auth.guard.spec.ts
  user-role.guard.ts                  # Authorization guard
```

---

## Import Aliases (Nx Monorepo Configuration)

### Available Aliases

From `tsconfig.base.json` lines 20-24:

| Alias                              | Resolves To                       | Use For                                     |
| ---------------------------------- | --------------------------------- | ------------------------------------------- |
| `@ai-nx-starter/types`             | `packages/types/src/`             | Shared DTOs, enums, constants               |
| `@ai-nx-starter/api-client`        | `packages/api-client/src/`        | Auto-generated API services                 |
| `@ai-nx-starter/backend-common`    | `packages/backend-common/src/`    | Shared enums, constants (frontend-safe)     |
| `@ai-nx-starter/data-access-layer` | `packages/data-access-layer/src/` | **NEVER** import in frontend - backend only |

### Usage Examples

```typescript
// ✅ PREFERRED - Use package aliases for cross-package imports
import { ClientUserDto, CreateUserDto } from '@ai-nx-starter/types';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { Role } from '@ai-nx-starter/backend-common';

// ✅ GOOD - Relative imports within same feature
import { UserListComponent } from './components/user-list/user-list.component';
import { UserService } from './services/user.service';
import { UserFilters } from './models/user-filters.model';

// ❌ NEVER - Don't import data-access-layer in frontend
import { UserDbService } from '@ai-nx-starter/data-access-layer'; // ❌

// ❌ AVOID - Relative paths to packages
import { ClientUserDto } from '../../../packages/types/src'; // ❌
```

### When to Use Which Alias

**@ai-nx-starter/types (Shared DTOs)**:

```typescript
import { ClientUserDto, CreateUserDto, UpdateUserDto } from '@ai-nx-starter/types';
import { ClientTeamDto } from '@ai-nx-starter/types';
```

**@ai-nx-starter/api-client (Auto-generated API)**:

```typescript
import { ApiUserService, ApiTeamService, ApiAuthService } from '@ai-nx-starter/api-client';
```

**@ai-nx-starter/backend-common (Shared Enums/Constants)**:

```typescript
import { Role, Permission } from '@ai-nx-starter/backend-common';
```

---

## File Naming Conventions

### Components

**Pattern**: kebab-case with `.component.ts` suffix

```
user-list.component.ts
user-list.component.html
user-list.component.less
user-list.component.spec.ts

team-detail.component.ts
team-detail.component.html
team-detail.component.less
```

**Directory Structure**:

```
components/
  user-list/
    user-list.component.ts
    user-list.component.html
    user-list.component.less
    user-list.component.spec.ts
```

**Avoid:**

- PascalCase: `UserList.component.ts` ❌
- camelCase: `userList.component.ts` ❌
- No suffix: `user-list.ts` ❌

### Services

**Pattern**: kebab-case with `.service.ts` suffix

```
user.service.ts
user.service.spec.ts
auth.service.ts
team-cache.service.ts
```

### Guards

**Pattern**: kebab-case with `.guard.ts` suffix

```
auth.guard.ts
auth.guard.spec.ts
role.guard.ts
```

### Directives

**Pattern**: kebab-case with `.directive.ts` suffix

```
user-highlight.directive.ts
auto-focus.directive.ts
```

### Pipes

**Pattern**: kebab-case with `.pipe.ts` suffix

```
user-name.pipe.ts
date-format.pipe.ts
```

### Models/Types

**Pattern**: kebab-case with `.model.ts` or `.interface.ts` suffix

```
models/
  user.model.ts
  user-filters.model.ts
  user-state.interface.ts
```

---

## When to Create a New Feature

### Create New Feature When:

- Multiple related components (>3)
- Has own API endpoints (via `@ai-nx-starter/api-client`)
- Domain-specific logic
- Will grow over time
- Reused across multiple routes

**Example:** `features/users/`

- 5+ components
- Own API service (ApiUserService from auto-generated client)
- State management service (UserService)
- Used in multiple routes

### Add to Existing Feature When:

- Related to existing feature
- Shares same API service
- Logically grouped
- Extends existing functionality

**Example:** Adding user export dialog to users feature

### Create Reusable Component When:

- Used across 3+ features
- Generic, no domain logic
- Pure presentation
- Shared pattern

**Example:** `components/loader/`

---

## Import Organization

### Import Order (Recommended)

```typescript
// 1. Angular Core
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// 2. RxJS
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, switchMap, catchError, takeUntil, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// 3. Angular Forms
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// 4. NG-ZORRO Components (alphabetical)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';

// 5. Monorepo Package Imports (@ai-nx-starter/*)
import { ApiUserService, ApiTeamService } from '@ai-nx-starter/api-client';
import { ClientUserDto, CreateUserDto } from '@ai-nx-starter/types';
import { Role } from '@ai-nx-starter/backend-common';

// 6. Feature Imports (relative)
import { UserService } from '../../services/user.service';
import { UserFilters } from '../../models/user-filters.model';
import { UserFormComponent } from '../user-form/user-form.component';
```

**Use single quotes** for all imports (project standard)

---

## Public API Pattern

### feature/index.ts

Export public API from feature for clean imports:

```typescript
// features/users/index.ts

// Export main components
export { UserListComponent } from './components/user-list/user-list.component';
export { UserDetailComponent } from './components/user-detail/user-detail.component';

// Export services
export { UserService } from './services/user.service';

// Export models
export type { UserListState, UserFilters } from './models/user.model';

// Export guards
export { UserAuthGuard } from './guards/user-auth.guard';
```

**Usage:**

```typescript
// ✅ Clean import from feature index
import { UserListComponent, UserService } from '../features/users';

// ✅ Also OK - explicit imports
import { UserListComponent } from '../features/users/components/user-list/user-list.component';
```

---

## Directory Structure Visualization

```
apps/
  web-ui/
    src/
      app/
        features/                           # Domain-specific features
          users/
            components/
              user-list/
                user-list.component.ts
                user-list.component.html
                user-list.component.less
                user-list.component.spec.ts
              user-detail/
                user-detail.component.ts
                user-detail.component.html
                user-detail.component.less
            services/
              user.service.ts
              user.service.spec.ts
            models/
              user.model.ts
            guards/
              user-auth.guard.ts
            index.ts
          teams/
            components/
            services/
            models/
            index.ts
          auth/
            components/
            services/
            guards/
            index.ts

        components/                         # Reusable components
          loader/
            loader.component.ts
            loader.component.html
            loader.component.less
            loader.component.spec.ts
          header/
            header.component.ts
            header.component.html
            header.component.less
          error-boundary/
            error-boundary.component.ts
            error-boundary.component.html

        core/                               # Core services
          services/
            auth.service.ts
            message.service.ts
          interceptors/
            auth.interceptor.ts
            error.interceptor.ts
          guards/
            auth.guard.ts

        shared/                             # Shared utilities
          utils/
            date.utils.ts
            validation.utils.ts
          constants/
            app.constants.ts

        app.component.ts
        app.component.html
        app.component.less
        app.routes.ts                       # Angular Router config

packages/
  types/                                    # Shared DTOs (backend + frontend)
  api-client/                               # Auto-generated API services
  backend-common/                           # Shared enums/constants
```

---

## Angular Router Integration

### Feature Routing

**Pattern**: Lazy load features for code splitting

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./features/users/components/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./features/users/components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
  },
  {
    path: 'teams',
    loadChildren: () => import('./features/teams/team-routing.module').then((m) => m.TeamRoutingModule),
  },
];
```

---

## Summary

**Key Principles:**

1. **features/** for domain-specific code (users, teams, auth)
2. **components/** for truly reusable UI (loader, header, error-boundary)
3. Use subdirectories: components/, services/, models/, guards/, directives/
4. Package aliases for cross-package imports (`@ai-nx-starter/*`)
5. Consistent naming: kebab-case for all Angular files
6. Export public API from feature index.ts
7. Lazy load features via Angular Router
8. Use auto-generated API client from `@ai-nx-starter/api-client`

**See Also:**

- [component-patterns-guide.md](component-patterns-guide.md) - Component structure
- [data-fetching-guide.md](data-fetching-guide.md) - API service patterns
- [styling-guide.md](styling-guide.md) - LESS files and naming conventions
- [routing-guide.md](routing-guide.md) - Feature routing and lazy loading
