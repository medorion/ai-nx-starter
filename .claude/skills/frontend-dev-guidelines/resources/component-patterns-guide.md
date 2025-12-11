# Component Patterns

Modern Angular component architecture emphasizing type safety, lazy loading, and reactive programming with RxJS.

---

## @Component Decorator Pattern (REQUIRED)

### Why @Component with TypeScript

All components use the `@Component` decorator with TypeScript for:

- Explicit metadata (selector, template, styles)
- Type safety for inputs and outputs
- Clear component interface documentation
- Better IDE autocomplete and refactoring

### Basic Pattern

```typescript
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Displays user information
 * @example
 * <app-user-display [userId]="123" (actionClick)="handleAction()"></app-user-display>
 */
@Component({
  selector: 'app-user-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-display.component.html',
  styleUrls: ['./user-display.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDisplayComponent {
  /** User ID to display */
  @Input() userId!: number;

  /** Emitted when action button is clicked */
  @Output() actionClick = new EventEmitter<void>();

  handleAction(): void {
    this.actionClick.emit();
  }
}
```

**Key Points:**

- Component class exported (no default export in Angular)
- @Input() for data in, @Output() for events out
- OnPush change detection for performance
- Separate template and style files
- JSDoc comments on inputs/outputs

---

## Lazy Loading Pattern

### When to Lazy Load

Lazy load components/modules that are:

- Route-level components (entire features)
- Heavy components (DataGrid, charts, rich text editors)
- Modal/dialog content (not shown initially)
- Below-the-fold content

### How to Lazy Load

**Route-level (Standalone Component):**

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./features/users/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'posts',
    loadChildren: () => import('./features/posts/posts.routes').then((m) => m.POSTS_ROUTES),
  },
];
```

**Feature Module (Legacy):**

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.module').then((m) => m.UsersModule),
  },
];
```

**Dynamic Component Loading:**

```typescript
import { Component, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  /* ... */
})
export class ParentComponent {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  async loadHeavyComponent(): Promise<void> {
    const { HeavyDataGridComponent } = await import('./heavy-data-grid.component');
    this.container.clear();
    this.container.createComponent(HeavyDataGridComponent);
  }
}
```

---

## Loading States

### Template-Based Loading (PREFERRED)

**Using \*ngIf with nz-spin:**

```html
<!-- user-list.component.html -->
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
```

**Using nz-skeleton (better UX):**

```html
<nz-skeleton *ngIf="loading" [nzActive]="true" [nzParagraph]="{ rows: 5 }"></nz-skeleton>

<nz-table *ngIf="!loading" [nzData]="users">
  <!-- table content -->
</nz-table>
```

**Async Pipe with Observable:**

```html
<nz-spin [nzSpinning]="loading$ | async">
  <div *ngIf="users$ | async as users">
    <nz-table [nzData]="users">
      <!-- table content -->
    </nz-table>
  </div>
</nz-spin>
```

### Component TypeScript

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto } from '@ai-nx-starter/types';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less'],
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
      .subscribe((users) => (this.users = users));
  }
}
```

---

## Component Structure Template

### Recommended Order

```typescript
/**
 * Component description - what it does, when to use it
 */
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Subject, Observable } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

// Auto-generated API Client
import { ApiMyFeatureService } from '@ai-nx-starter/api-client';

// Shared Types
import { MyDataDto } from '@ai-nx-starter/types';

// Core Services
import { MessageService } from '@/app/core/services/message.service';
import { LoggerService } from '@/app/core/services/logger.service';

// Feature Services
import { MyFeatureService } from '../services/my-feature.service';

// 1. COMPONENT DECORATOR
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule],
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponentComponent implements OnInit, OnDestroy {
  // 2. INPUTS (with JSDoc)
  /** The ID of the entity to display */
  @Input() entityId!: number;

  /** Display mode */
  @Input() mode: 'view' | 'edit' = 'view';

  // 3. OUTPUTS (with JSDoc)
  /** Emitted when action completes */
  @Output() complete = new EventEmitter<void>();

  // 4. PUBLIC PROPERTIES (template bindings)
  data: MyDataDto[] = [];
  loading = false;
  error: string | null = null;

  // 5. PRIVATE PROPERTIES
  private destroy$ = new Subject<void>();

  // 6. CONSTRUCTOR (dependency injection)
  constructor(
    private apiMyFeatureService: ApiMyFeatureService,
    private myFeatureService: MyFeatureService,
    private messageService: MessageService,
    private logger: LoggerService,
  ) {}

  // 7. LIFECYCLE HOOKS
  ngOnInit(): void {
    this.loadData();
    this.subscribeToUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 8. PUBLIC METHODS (called from template)
  handleSave(): void {
    this.loading = true;
    this.apiMyFeatureService
      .updateEntity(this.entityId, {
        /* data */
      })
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((err) => {
          this.messageService.error('Failed to update entity');
          this.logger.error('Update failed', err);
          throw err;
        }),
      )
      .subscribe(() => {
        this.messageService.success('Entity updated successfully');
        this.complete.emit();
      });
  }

  handleItemSelect(itemId: string): void {
    this.logger.info('Item selected', itemId);
    // Handle selection
  }

  // 9. PRIVATE METHODS (internal logic)
  private loadData(): void {
    this.loading = true;
    this.apiMyFeatureService
      .getData(this.entityId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false)),
      )
      .subscribe((data) => {
        this.data = data;
      });
  }

  private subscribeToUpdates(): void {
    this.myFeatureService.updates$.pipe(takeUntil(this.destroy$)).subscribe((update) => {
      this.handleUpdate(update);
    });
  }

  private handleUpdate(update: any): void {
    // Handle realtime update
  }
}
```

---

## Component Separation

### When to Split Components

**Split into multiple components when:**

- Component exceeds 300 lines
- Multiple distinct responsibilities
- Reusable sections
- Complex nested templates

**Example:**

```typescript
// ❌ AVOID - Monolithic
@Component({
  selector: 'app-massive-component',
  /* ... */
})
export class MassiveComponent {
  // 500+ lines
  // Search logic
  // Filter logic
  // Grid logic
  // Action panel logic
}

// ✅ PREFERRED - Modular
@Component({
  selector: 'app-parent-container',
  template: `
    <app-search-and-filter (filter)="handleFilter($event)"></app-search-and-filter>
    <app-data-grid [data]="filteredData"></app-data-grid>
    <app-action-panel (action)="handleAction($event)"></app-action-panel>
  `,
})
export class ParentContainerComponent {
  filteredData: Data[] = [];

  handleFilter(criteria: FilterCriteria): void {
    // Filter logic
  }

  handleAction(action: Action): void {
    // Action logic
  }
}
```

### When to Keep Together

**Keep in same component when:**

- Component < 200 lines
- Tightly coupled logic
- Not reusable elsewhere
- Simple presentation component

---

## Component Communication

### Parent to Child (@Input)

```typescript
// Parent Component
@Component({
  selector: 'app-parent',
  template: `<app-child [data]="userData" [mode]="displayMode"></app-child>`,
})
export class ParentComponent {
  userData: UserDto[] = [];
  displayMode: 'list' | 'grid' = 'list';
}

// Child Component
@Component({
  selector: 'app-child',
  /* ... */
})
export class ChildComponent {
  @Input() data!: UserDto[];
  @Input() mode: 'list' | 'grid' = 'list';
}
```

### Child to Parent (@Output)

```typescript
// Child Component
@Component({
  selector: 'app-child',
  template: `<button (click)="handleClick()">Select</button>`,
})
export class ChildComponent {
  @Output() itemSelected = new EventEmitter<string>();

  handleClick(): void {
    this.itemSelected.emit('item-123');
  }
}

// Parent Component
@Component({
  selector: 'app-parent',
  template: `<app-child (itemSelected)="onItemSelected($event)"></app-child>`,
})
export class ParentComponent {
  onItemSelected(itemId: string): void {
    console.log('Selected:', itemId);
  }
}
```

### Avoid Deep Nesting - Use Services

```typescript
// ❌ AVOID - Prop drilling 5+ levels
<app-a [data]="x">
  <app-b [data]="x">
    <app-c [data]="x">
      <app-d [data]="x">
        <app-e [data]="x"></app-e>  <!-- Finally uses it here -->
      </app-d>
    </app-c>
  </app-b>
</app-a>

// ✅ PREFERRED - Service with BehaviorSubject
@Injectable({ providedIn: 'root' })
export class DataService {
  private _data$ = new BehaviorSubject<Data | null>(null);
  readonly data$ = this._data$.asObservable();

  updateData(data: Data): void {
    this._data$.next(data);
  }
}

// Deep child component
@Component({/* ... */})
export class DeepChildComponent implements OnInit {
  data$: Observable<Data | null>;

  constructor(private dataService: DataService) {
    this.data$ = this.dataService.data$;
  }
}

// Template
<div *ngIf="data$ | async as data">{{ data.value }}</div>
```

---

## Advanced Patterns

### Smart vs Dumb Components

**Smart Component (Container):**

```typescript
// Handles data fetching, state management, business logic
@Component({
  selector: 'app-users-container',
  template: ` <app-users-list [users]="users" [loading]="loading" (userSelected)="handleUserSelect($event)"></app-users-list> `,
})
export class UsersContainerComponent implements OnInit {
  users: UserDto[] = [];
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
      .subscribe((users) => (this.users = users));
  }

  handleUserSelect(userId: string): void {
    // Handle selection logic
  }
}
```

**Dumb Component (Presentational):**

```typescript
// Pure presentation, no business logic, just displays data
@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // Important!
})
export class UsersListComponent {
  @Input() users: UserDto[] = [];
  @Input() loading = false;
  @Output() userSelected = new EventEmitter<string>();

  onUserClick(userId: string): void {
    this.userSelected.emit(userId);
  }
}
```

### Component Composition with NG-ZORRO

```typescript
// Using nz-card composition
@Component({
  selector: 'app-user-details',
  template: `
    <nz-card [nzTitle]="cardTitle" [nzExtra]="cardActions">
      <nz-card-meta [nzTitle]="user.name" [nzDescription]="user.email"></nz-card-meta>

      <div class="content">
        <p>{{ user.bio }}</p>
      </div>
    </nz-card>

    <ng-template #cardTitle>
      <span>User Profile</span>
    </ng-template>

    <ng-template #cardActions>
      <button nz-button nzType="primary" (click)="handleEdit()">Edit</button>
    </ng-template>
  `,
})
export class UserDetailsComponent {
  @Input() user!: UserDto;
  @Output() edit = new EventEmitter<void>();

  handleEdit(): void {
    this.edit.emit();
  }
}
```

### Template References (ng-template)

```typescript
@Component({
  selector: 'app-data-provider',
  template: `
    <div *ngIf="data$ | async as data; else loading">
      <ng-container *ngTemplateOutlet="contentTemplate; context: { $implicit: data }"></ng-container>
    </div>

    <ng-template #loading>
      <nz-spin></nz-spin>
    </ng-template>
  `,
})
export class DataProviderComponent {
  @Input() contentTemplate!: TemplateRef<any>;
  data$: Observable<Data>;

  constructor(private apiService: ApiService) {
    this.data$ = this.apiService.getData();
  }
}

// Usage
<app-data-provider [contentTemplate]="dataDisplay"></app-data-provider>

<ng-template #dataDisplay let-data>
  <app-display [data]="data"></app-display>
</ng-template>
```

---

## Summary

**Modern Angular Component Recipe:**

1. `@Component` decorator with TypeScript
2. Lazy load routes: `loadComponent: () => import()`
3. Template loading states with `*ngIf` and `nz-spin`/`nz-skeleton`
4. Use auto-generated API client from `@ai-nx-starter/api-client`
5. Import from packages: `@ai-nx-starter/types`, `@ai-nx-starter/api-client`
6. OnPush change detection for performance
7. takeUntil pattern for subscription cleanup
8. Separate template and style files
9. No early returns - handle loading in template

**See Also:**

- [data-fetching-guide.md](data-fetching-guide.md) - API client and RxJS patterns
- [file-organization-guide.md](file-organization-guide.md) - Feature and component structure
- [styling-guide.md](styling-guide.md) - LESS styling and theme variables
- [routing-guide.md](routing-guide.md) - Route configuration and lazy loading
- [loading-and-error-states-guide.md](loading-and-error-states-guide.md) - Loading states and error handling
