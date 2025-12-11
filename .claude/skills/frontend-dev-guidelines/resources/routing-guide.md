# Routing Guide

Angular Router implementation with configuration-based routing, lazy loading, and route guards.

---

## Angular Router Overview

**Angular Router** with configuration-based routing:

- Routes defined in configuration objects
- Lazy loading with `loadComponent` / `loadChildren`
- Type-safe navigation with Router service
- Route guards for authentication/authorization
- Resolvers for data prefetching
- Child routes with `<router-outlet>`

---

## Route Configuration

### Basic Route Configuration

```typescript
// apps/web-ui/src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/components/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
```

**Key Points:**

- `path`: URL segment
- `loadComponent`: Lazy load standalone component
- `redirectTo`: Redirect to another route
- `pathMatch: 'full'`: Match entire path
- `**`: Wildcard route (404 page)

---

## Lazy Loading Routes

### Lazy Load Component

```typescript
{
  path: 'users',
  loadComponent: () => import('./features/users/components/user-list/user-list.component').then((m) => m.UserListComponent),
}
```

### Lazy Load Module (Feature Module)

```typescript
{
  path: 'admin',
  loadChildren: () => import('./features/admin/admin-routing.module').then((m) => m.AdminRoutingModule),
}
```

### Why Lazy Load Routes?

- **Code splitting**: Smaller initial bundle
- **Faster initial load**: Load only what's needed
- **On-demand loading**: Load route code when navigated to
- **Better performance**: Reduce time to interactive

---

## Route Data

### Static Route Data

```typescript
{
  path: 'users',
  loadComponent: () => import('./features/users/components/user-list/user-list.component').then((m) => m.UserListComponent),
  data: {
    title: 'User Management',
    breadcrumb: 'Users',
    requiresAuth: true,
  },
}
```

**Accessing Route Data:**

```typescript
@Component({
  /* ... */
})
export class UserListComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      console.log(data['title']); // 'User Management'
      console.log(data['breadcrumb']); // 'Users'
    });
  }
}
```

### Route Resolvers (Data Prefetching)

```typescript
// user.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto } from '@ai-nx-starter/types';

export const userResolver: ResolveFn<ClientUserDto> = (route, state) => {
  const apiUserService = inject(ApiUserService);
  const userId = route.paramMap.get('id')!;
  return apiUserService.getUser(userId);
};
```

**Using Resolver:**

```typescript
{
  path: 'users/:id',
  loadComponent: () => import('./features/users/components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
  resolve: {
    user: userResolver,
  },
}
```

**Accessing Resolved Data:**

```typescript
@Component({
  /* ... */
})
export class UserDetailComponent implements OnInit {
  user: ClientUserDto | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.user = data['user'];
    });
  }
}
```

---

## Dynamic Routes

### Route with Parameter

```typescript
{
  path: 'users/:id',
  loadComponent: () => import('./features/users/components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
}
```

**Accessing Route Parameters:**

```typescript
@Component({
  /* ... */
})
export class UserDetailComponent implements OnInit {
  userId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Option 1: Snapshot (one-time read)
    this.userId = this.route.snapshot.paramMap.get('id');

    // Option 2: Observable (updates on param changes)
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');
      this.loadUser(this.userId!);
    });
  }
}
```

### Multiple Parameters

```typescript
{
  path: 'teams/:teamId/users/:userId',
  loadComponent: () => import('./features/team-user/team-user.component').then((m) => m.TeamUserComponent),
}
```

**Accessing Multiple Parameters:**

```typescript
ngOnInit(): void {
  this.route.paramMap.subscribe((params) => {
    const teamId = params.get('teamId');
    const userId = params.get('userId');
    this.loadTeamUser(teamId!, userId!);
  });
}
```

### Query Parameters

```typescript
// Navigate to: /users?search=john&page=2

ngOnInit(): void {
  this.route.queryParamMap.subscribe((queryParams) => {
    const search = queryParams.get('search'); // 'john'
    const page = queryParams.get('page'); // '2'
    this.loadUsers(search, parseInt(page || '1', 10));
  });
}
```

---

## Navigation

### Programmatic Navigation

```typescript
import { Router } from '@angular/router';

@Component({
  /* ... */
})
export class MyComponent {
  constructor(private router: Router) {}

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }

  navigateToUserDetail(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  navigateWithQueryParams(): void {
    this.router.navigate(['/users'], {
      queryParams: { search: 'john', page: 2 },
    });
  }
}
```

### Relative Navigation

```typescript
constructor(private router: Router, private route: ActivatedRoute) {}

navigateRelative(): void {
  // From /users/123, navigate to /users/123/edit
  this.router.navigate(['edit'], { relativeTo: this.route });
}

navigateUp(): void {
  // From /users/123/edit, navigate to /users/123
  this.router.navigate(['..'], { relativeTo: this.route });
}
```

### Template Navigation

```html
<!-- Basic link -->
<a routerLink="/users">Users</a>

<!-- With parameter -->
<a [routerLink]="['/users', userId]">View User</a>

<!-- With query params -->
<a [routerLink]="['/users']" [queryParams]="{ search: 'john', page: 2 }">Search Users</a>

<!-- Relative navigation -->
<a routerLink="edit">Edit</a>
<a routerLink="../">Back</a>

<!-- Active link highlighting -->
<a routerLink="/users" routerLinkActive="active-link">Users</a>
```

---

## Route Guards

### Authentication Guard

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
```

**Using Guard:**

```typescript
{
  path: 'admin',
  loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
  canActivate: [authGuard],
}
```

### Role-Based Guard

```typescript
// role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getUserRole();

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirect to unauthorized page
    router.navigate(['/unauthorized']);
    return false;
  };
};
```

**Using Role Guard:**

```typescript
{
  path: 'admin',
  loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
  canActivate: [roleGuard(['admin', 'superadmin'])],
}
```

### Can Deactivate Guard (Unsaved Changes)

```typescript
// can-deactivate.guard.ts
import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.canDeactivate()) {
    return true;
  }

  return confirm('You have unsaved changes. Do you really want to leave?');
};
```

**Using Can Deactivate Guard:**

```typescript
{
  path: 'users/create',
  loadComponent: () => import('./features/users/components/user-form/user-form.component').then((m) => m.UserFormComponent),
  canDeactivate: [canDeactivateGuard],
}
```

**Component Implementation:**

```typescript
@Component({
  /* ... */
})
export class UserFormComponent implements CanComponentDeactivate {
  form: FormGroup;
  formChanged = false;

  canDeactivate(): boolean {
    return !this.formChanged;
  }
}
```

---

## Child Routes

### Nested Routes Configuration

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then((m) => m.UsersComponent),
        data: { breadcrumb: 'Users' },
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/settings.component').then((m) => m.SettingsComponent),
        data: { breadcrumb: 'Settings' },
      },
    ],
  },
];
```

### Parent Component with Router Outlet

```typescript
// admin-layout.component.ts
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <div class="admin-sidebar">
        <a routerLink="dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="users" routerLinkActive="active">Users</a>
        <a routerLink="settings" routerLinkActive="active">Settings</a>
      </div>
      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {}
```

---

## Feature Module Routing

### Feature Routing Module

```typescript
// features/users/user-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'create',
    loadComponent: () => import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
```

### Using Feature Module

```typescript
// app.routes.ts
{
  path: 'users',
  loadChildren: () => import('./features/users/user-routing.module').then((m) => m.UserRoutingModule),
}
```

---

## Route Structure Example

### Complete Route Configuration

```typescript
// apps/web-ui/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Home
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    data: { title: 'Home', breadcrumb: 'Home' },
  },

  // Authentication
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    data: { title: 'Login' },
  },

  // Users (Protected)
  {
    path: 'users',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/users/components/user-list/user-list.component').then((m) => m.UserListComponent),
        data: { title: 'Users', breadcrumb: 'Users' },
      },
      {
        path: 'create',
        loadComponent: () => import('./features/users/components/user-form/user-form.component').then((m) => m.UserFormComponent),
        data: { title: 'Create User', breadcrumb: 'Create' },
      },
      {
        path: ':id',
        loadComponent: () => import('./features/users/components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
        data: { title: 'User Detail', breadcrumb: 'Detail' },
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/users/components/user-form/user-form.component').then((m) => m.UserFormComponent),
        data: { title: 'Edit User', breadcrumb: 'Edit' },
      },
    ],
  },

  // Admin (Role-based)
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard(['admin'])],
    data: { breadcrumb: 'Admin' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/settings.component').then((m) => m.SettingsComponent),
        data: { breadcrumb: 'Settings' },
      },
    ],
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    data: { title: 'Page Not Found' },
  },
];
```

---

## Root Component Setup

### Main App Component

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.less'],
})
export class AppComponent {}
```

### Bootstrap with Routes

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
}).catch((err) => console.error(err));
```

---

## Advanced Patterns

### Route Transition Animations

```typescript
// animations.ts
import { trigger, transition, style, animate } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);
```

**Using Animations:**

```typescript
@Component({
  selector: 'app-root',
  template: `
    <div [@routeAnimations]="outlet.isActivated ? outlet.activatedRoute : ''">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  animations: [routeAnimations],
})
export class AppComponent {}
```

### Breadcrumb Navigation

```typescript
// breadcrumb.service.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const root = this.router.routerState.snapshot.root;
      const breadcrumbs = this.createBreadcrumbs(root);
      this.breadcrumbsSubject.next(breadcrumbs);
    });
  }

  private createBreadcrumbs(route: ActivatedRouteSnapshot, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL = child.url.map((segment) => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
```

**Breadcrumb Component:**

```typescript
@Component({
  selector: 'app-breadcrumb',
  template: `
    <nz-breadcrumb>
      <nz-breadcrumb-item *ngFor="let breadcrumb of breadcrumbs$ | async">
        <a [routerLink]="breadcrumb.url">{{ breadcrumb.label }}</a>
      </nz-breadcrumb-item>
    </nz-breadcrumb>
  `,
})
export class BreadcrumbComponent {
  breadcrumbs$ = this.breadcrumbService.breadcrumbs$;

  constructor(private breadcrumbService: BreadcrumbService) {}
}
```

---

## Summary

**Routing Checklist:**

- ✅ Define routes in `app.routes.ts`
- ✅ Lazy load with `loadComponent` / `loadChildren`
- ✅ Use route guards (`canActivate`, `canDeactivate`)
- ✅ Add route data for breadcrumbs/titles
- ✅ Use resolvers for data prefetching
- ✅ Navigate with `Router` service or `routerLink`
- ✅ Access params with `ActivatedRoute`
- ✅ Use `<router-outlet>` for child routes
- ✅ Protect routes with authentication/authorization guards

**See Also:**

- [component-patterns-guide.md](component-patterns-guide.md) - Lazy loading patterns
- [file-organization-guide.md](file-organization-guide.md) - Feature structure and routing modules
