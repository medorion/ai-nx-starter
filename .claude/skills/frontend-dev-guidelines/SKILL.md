---
name: frontend-dev-guidelines
description: Frontend development guidelines for Angular 19/TypeScript applications. Covers NG-ZORRO components, RxJS state management, auto-generated API clients, LESS styling with themes, feature-based organization, decorators, and performance optimization. Use when creating components, services, features, styling, routing, or working with frontend code.
---

# Frontend Development Guidelines

## Purpose

Establish consistency and best practices for Angular 19 frontend development using NG-ZORRO, RxJS, and modern TypeScript patterns.

## When to Use This Skill

- Creating new components or pages
- Building new features
- Fetching data with auto-generated API client (@ai-nx-starter/api-client) and RxJS
- Setting up routing with Angular Router
- Styling components with NG-ZORRO and LESS themes
- Performance optimization
- Organizing frontend code
- TypeScript best practices

---

### New Component Checklist

Creating a component? Follow this checklist:

- [ ] Use `@Component` decorator with standalone: true (Angular 19 default)
- [ ] Lazy load feature modules via router or use dynamic component loading for heavy components
- [ ] Handle loading states in template with `*ngIf` and NG-ZORRO `nz-spin`
- [ ] Use auto-generated `@ai-nx-starter/api-client` services with RxJS operators
- [ ] Import from packages: `@ai-nx-starter/types`, `@ai-nx-starter/api-client`
- [ ] Styles: Inline if <100 lines, separate `.less` file if >100 lines
- [ ] Use component methods for event handlers (avoid inline arrow functions in templates)
- [ ] Export component class (named export, not default)
- [ ] Use `*ngIf="data$ | async as data"` pattern for observables (no manual subscriptions)
- [ ] Use `NzMessageService` or `NzNotificationService` for user notifications
- [ ] Apply `OnPush` change detection strategy for performance
- [ ] Implement `OnDestroy` and unsubscribe from manual subscriptions (or use `takeUntilDestroyed()`)

### New Feature Checklist

Creating a feature? Set up this structure:

- [ ] Create `features/{feature-name}/` directory in `apps/web-ui/src/app/`
- [ ] Create subdirectories: `components/`, `services/`, `models/`, `guards/`, `directives/` (as needed)
- [ ] Define DTOs/types in `@ai-nx-starter/types` package (shared with backend)
- [ ] Use auto-generated API services from `@ai-nx-starter/api-client` (NO manual HTTP services)
- [ ] Create feature routing module: `{feature-name}-routing.module.ts` or use standalone route config
- [ ] Configure lazy loading in parent router: `loadChildren` or `loadComponent`
- [ ] Create feature barrel export: `index.ts` for public API
- [ ] Apply `OnPush` change detection to all feature components
- [ ] Handle loading states with `*ngIf` and NG-ZORRO `nz-spin` or `nz-skeleton`
- [ ] Use RxJS operators (`map`, `switchMap`, `catchError`) for data transformation
- [ ] Implement error handling with `@ai-nx-starter/backend-common` exception types
- [ ] Add route guards if authentication/authorization required

---

## Import Aliases Quick Reference

| Alias                              | Resolves To                       | Usage                                                        |
| ---------------------------------- | --------------------------------- | ------------------------------------------------------------ |
| `@ai-nx-starter/types`             | `packages/types/src/`             | `import { ClientUserDto } from '@ai-nx-starter/types'`       |
| `@ai-nx-starter/api-client`        | `packages/api-client/src/`        | `import { ApiUserService } from '@ai-nx-starter/api-client'` |
| `@ai-nx-starter/backend-common`    | `packages/backend-common/src/`    | `import { Role } from '@ai-nx-starter/backend-common'`       |
| `@ai-nx-starter/data-access-layer` | `packages/data-access-layer/src/` | Backend only - DO NOT import in frontend                     |

**Defined in**: `tsconfig.base.json` lines 20-24

**Key Rules**:

- ✅ **ALWAYS** use package aliases for cross-package imports
- ✅ Import DTOs from `@ai-nx-starter/types` (shared with backend)
- ✅ Use API services from `@ai-nx-starter/api-client` (auto-generated)
- ❌ **NEVER** import from `@ai-nx-starter/data-access-layer` in frontend code
- ❌ **NEVER** use relative paths for package imports like `../../../packages/types`

---

## Common Imports Cheatsheet

```typescript
// Angular Core & RxJS
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, catchError, takeUntil, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// NG-ZORRO Components (import as needed)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

// Angular Router
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

// Angular Forms
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Auto-generated API Client (NO manual HTTP services!)
import { UserService, PostService, AuthService } from '@ai-nx-starter/api-client';

// Shared Types from monorepo
import { PostDto, UserDto, CreatePostDto } from '@ai-nx-starter/types';

// Feature Components (local imports)
import { LoaderComponent } from '../components/loader/loader.component';
import { HeaderComponent } from '../components/header/header.component';
```

---

## Component Patterns

**Modern Angular components use:**

- `@Component` decorator with TypeScript for type safety
- Lazy loading via router (`loadComponent`) for code splitting
- `*ngIf` with `nz-spin` or `nz-skeleton` for loading states
- OnPush change detection for performance

**Key Concepts:**

- Lazy load heavy components (DataGrid, charts, rich editors)
- Use `*ngIf` template directives for loading/error states
- Apply `OnPush` change detection strategy
- Component structure: Decorator → Inputs/Outputs → Lifecycle → Methods

**[📖 Complete Guide: resources/component-patterns-guide.md](resources/component-patterns-guide.md)**

---

## Data Fetching

**Modern data fetching uses:**

- Auto-generated API client from `@ai-nx-starter/api-client` (NO manual HTTP services)
- RxJS Observables with operators (`finalize`, `catchError`, `tap`, `switchMap`)
- Service layer with BehaviorSubject for state management and caching
- Template-based loading states with `*ngIf` and `nz-spin`

**Key Concepts:**

- Use auto-generated API services (ApiUserService, ApiPostService, etc.)
- Service layer with BehaviorSubject for caching and state
- RxJS operators for data transformation and error handling
- Cache-first strategies to reduce API calls
- Parallel fetching with forkJoin and combineLatest

**[📖 Complete Guide: resources/data-fetching-guide.md](resources/data-fetching-guide.md)**

---

## File Organization

**features/ vs components/:**

- `features/`: Domain-specific features (users, teams, auth)
- `components/`: Truly reusable UI (loader, header, error-boundary)

**Feature Subdirectories:**

```
features/
  my-feature/
    components/       # Feature components
    services/         # State management with BehaviorSubject
    models/           # Frontend-specific types
    guards/           # Route guards
    directives/       # Custom directives
```

**Key Concepts:**

- Feature-based organization in `apps/web-ui/src/app/features/`
- Package aliases for imports: `@ai-nx-starter/*`
- kebab-case naming for all files (user-list.component.ts)
- Services with BehaviorSubject for state management
- Lazy loading via Angular Router

**[📖 Complete Guide: resources/file-organization-guide.md](resources/file-organization-guide.md)**

---

## Styling

**Inline vs Separate:**

- <100 lines: Inline in `.component.less` file
- > 100 lines: Organize with section comments in `.component.less`

**Primary Method:**

- Use LESS for component styles
- Theme variables: `@primary-color`, `@padding-md`, `@component-background`
- Component-scoped in `.component.less` files

**NG-ZORRO Grid:**

```typescript
<div nz-col [nzXs]="24" [nzMd]="12">  // ✅ Responsive grid
<div nz-col [nzSpan]="12">            // ✅ Fixed width
```

**Key Concepts:**

- LESS preprocessing with theme variables
- 2 space indentation (project standard)
- kebab-case for class names
- Use `::ng-deep` sparingly (only for child components)

**[📖 Complete Guide: resources/styling-guide.md](resources/styling-guide.md)**

---

## Routing

**Angular Router - Configuration-Based:**

- Define routes in `app.routes.ts`
- Lazy load with `loadComponent` / `loadChildren`
- Route guards for authentication/authorization
- Route data for breadcrumbs/titles

**Example:**

```typescript
export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./features/users/user-list.component').then((m) => m.UserListComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Users' },
  },
];
```

**Key Concepts:**

- Lazy loading for code splitting
- Route guards (`canActivate`, `canDeactivate`)
- Resolvers for data prefetching
- Navigation with `Router` service or `routerLink`
- Child routes with `<router-outlet>`

**[📖 Complete Guide: resources/routing-guide.md](resources/routing-guide.md)**

---

## Loading & Error States

**CRITICAL RULE: No Early Returns**

```html
<!-- ❌ NEVER - Causes layout shift -->
<div *ngIf="loading"><nz-spin></nz-spin></div>
<div *ngIf="!loading"><nz-table [nzData]="users"></nz-table></div>

<!-- ✅ ALWAYS - Consistent layout -->
<nz-spin [nzSpinning]="loading">
  <nz-table [nzData]="users"></nz-table>
</nz-spin>
```

**Why:** Prevents Cumulative Layout Shift (CLS), better UX

**Loading Patterns:**

- `nz-spin` with `[nzSpinning]` - Loading overlay (preferred)
- `nz-skeleton` - Skeleton loading for initial loads
- Template with fixed container height

**Error Handling:**

- Use `NzMessageService` for user feedback
- `NzNotificationService` for rich content
- RxJS `catchError` for error handling
- HTTP interceptors for global errors

**[📖 Complete Guide: resources/loading-and-error-states-guide.md](resources/loading-and-error-states-guide.md)**

---

## Performance

**Optimization Patterns:**

- **OnPush change detection** - Use for all components (most important!)
- **trackBy functions** - For all \*ngFor loops
- **Computed signals** - Memoized expensive calculations
- **Debounced search** - RxJS debounceTime (300-500ms)
- **Memory leak prevention** - takeUntilDestroyed or takeUntil pattern

**Key Optimizations:**

- OnPush only checks when `@Input()` changes or events fire
- trackBy prevents DOM recreation in lists
- Immutable data patterns (create new references)
- Virtual scrolling for large lists (100+ items)
- Lazy load modules and heavy libraries

**[📖 Complete Guide: resources/performance-guide.md](resources/performance-guide.md)**

---

## TypeScript

**Standards:**

- Strict mode enabled, no `any` type
- Explicit return types on functions and methods
- Type imports: `import type { ClientUserDto } from '@ai-nx-starter/types'`
- JSDoc comments on Input/Output decorators
- Utility types (Partial, Pick, Omit, Required, Record)

**Key Patterns:**

- Typed Observables and BehaviorSubjects
- Type guards for narrowing unknown types
- Optional chaining (?.) and nullish coalescing (??)
- Generic services and components
- Interface for objects, type for unions

**[📖 Complete Guide: resources/typescript-standards-guide.md](resources/typescript-standards-guide.md)**

---

## Common Patterns

**Covered Topics:**

- AuthService for authentication and current user
- Reactive Forms with validators (built-in and custom)
- NG-ZORRO Modal and dialog patterns
- NG-ZORRO Table with pagination, sorting, filtering
- Mutation patterns with auto-generated API client
- BehaviorSubject services for state management

**Key Patterns:**

- AuthService with currentUser$, login, logout, hasRole
- Form validation with Validators and custom validators
- Modal service for confirm dialogs
- Table with server-side or client-side operations
- Cache invalidation after mutations

**[📖 Complete Guide: resources/common-patterns-guide.md](resources/common-patterns-guide.md)**

---

## Complete Examples

**Full Working Examples:**

- Modern component with OnPush, RxJS, auto-generated API client
- Complete feature structure with routing, services, guards
- BehaviorSubject service for caching and state management
- Reactive forms with validation and API integration
- List component with filtering, sorting, pagination

**Key Examples:**

- User profile component with loading states and error handling
- Feature module with lazy loading and route guards
- Service layer with BehaviorSubject caching
- Form component with reactive validation
- Table component with NG-ZORRO and client-side filtering

**[📖 Complete Guide: resources/complete-examples-guide.md](resources/complete-examples-guide.md)**

---

## Project-Specific Extensions

This project includes additional utilities, decorators, and conventions beyond standard Angular:

### Configuration

- **AppConfigService**: All configuration MUST go through `AppConfigService` (in api-client package)
- Config file: `/apps/web-ui/src/assets/config.json` (generated from Docker ENV variables)
- **NO** hardcoded configuration values in components/services

### Component Defaults

- Components are `standalone: false` by default (use `standalone: true` only when specified)
- Always use separate files for HTML, LESS, and TypeScript

### Styling Utilities

**Helper classes from `theme-general.less`:**

- Margins/padding: `mt-1`, `p-2`, etc.
- Font weights: `fw-bold`, `fw-light`, etc.
- Form sections: Use predefined `form-section` class

**Global styling rules:**

- HTML base element styles can ONLY be overridden in `apps/web-ui/src/assets/styles/theme.less`
- **NO** font or background color modifications in component `.less` files
- ALL colors MUST use theme variables

### Available Decorators

Project-specific decorators in `core/`:

- `@catchError()` - Error handling wrapper
- `@log()` - Method logging
- `@measure()` - Performance measurement
- `@debounce(300)` - Input debouncing
- `@engagement()` - User engagement tracking
- `@requireRole('admin')` - Role-based access control
- `@minFeatureFlag('feature')` - Feature flag requirements

### Available Components

Utility components in `core/`:

- Busy indicator component
- Display Flow component (for async operations)
- Standardized context menu component

### Available Utilities

Helper functions:

- `sleep()` - Delays/testing function

### Form Validation

- Use `FormGroupService` for handling complex form validation
- Reference: `features/zorro-components/forms`

### Icons

- Update icons module when using new icons: `/shared/icons/icons.module.ts`

### Internationalization

- Default language: `en_US`
- Currently supporting `en_US` only
- Code prepared for future multi-language support

---

## Navigation Guide

| Need to...               | Read this resource                                                               |
| ------------------------ | -------------------------------------------------------------------------------- |
| Create a component       | [component-patterns-guide.md](resources/component-patterns-guide.md)             |
| Fetch data               | [data-fetching-guide.md](resources/data-fetching-guide.md)                       |
| Organize files/folders   | [file-organization-guide.md](resources/file-organization-guide.md)               |
| Style components         | [styling-guide.md](resources/styling-guide.md)                                   |
| Set up routing           | [routing-guide.md](resources/routing-guide.md)                                   |
| Handle loading/errors    | [loading-and-error-states-guide.md](resources/loading-and-error-states-guide.md) |
| Optimize performance     | [performance-guide.md](resources/performance-guide.md)                           |
| TypeScript types         | [typescript-standards-guide.md](resources/typescript-standards-guide.md)         |
| Forms/Auth/Tables/Modals | [common-patterns-guide.md](resources/common-patterns-guide.md)                   |
| See full examples        | [complete-examples-guide.md](resources/complete-examples-guide.md)               |
| Logging and debugging    | [logging-guide.md](resources/logging-guide.md)                                   |
| Security best practices  | [security-guide.md](resources/security-guide.md)                                 |

---

## Related Skills

- **backend-dev-guidelines**: Backend API patterns that frontend consumes
