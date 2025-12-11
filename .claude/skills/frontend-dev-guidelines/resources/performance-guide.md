# Performance Optimization

Patterns for optimizing Angular component performance, preventing unnecessary change detection, and avoiding memory leaks.

---

## Change Detection Strategy: OnPush

### The Most Important Optimization

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

// ❌ AVOID - Default change detection (checks on every event)
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users">
      {{ user.name }}
    </div>
  `,
  // changeDetection: ChangeDetectionStrategy.Default  // Default
})
export class UserListComponent {}

// ✅ CORRECT - OnPush change detection (only checks when inputs change or events fire)
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users; trackBy: trackByUserId">
      {{ user.name }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  @Input() users: User[] = [];

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
```

**When to use OnPush:**

- **ALWAYS** use it for all components (default in new projects)
- Especially important for list items
- Components with expensive templates
- Components that render frequently

**How OnPush works:**

- Only checks when:
  - `@Input()` reference changes
  - Event fires from component template
  - `async` pipe receives new value
  - Manual `ChangeDetectorRef.markForCheck()`

---

## Computed Values and Memoization

### Using Getters with Memoization

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-display',
  template: `
    <div *ngFor="let item of filteredAndSortedItems; trackBy: trackByItemId">
      {{ item.name }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataDisplayComponent {
  @Input() items: Item[] = [];
  @Input() searchTerm: string = '';

  private _cachedItems: Item[] = [];
  private _cachedSearchTerm: string = '';
  private _cachedResult: Item[] = [];

  // ❌ AVOID - Runs on every change detection cycle!
  get filteredItems(): Item[] {
    return this.items
      .filter((item) => item.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // ✅ CORRECT - Memoized, only recalculates when inputs change
  get filteredAndSortedItems(): Item[] {
    if (this._cachedItems === this.items && this._cachedSearchTerm === this.searchTerm) {
      return this._cachedResult;
    }

    this._cachedItems = this.items;
    this._cachedSearchTerm = this.searchTerm;
    this._cachedResult = this.items
      .filter((item) => item.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));

    return this._cachedResult;
  }

  trackByItemId(index: number, item: Item): number {
    return item.id;
  }
}
```

### Using Signals (Angular 16+)

```typescript
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-data-display',
  template: `
    <div *ngFor="let item of filteredItems(); trackBy: trackByItemId">
      {{ item.name }}
    </div>
  `,
})
export class DataDisplayComponent {
  items = signal<Item[]>([]);
  searchTerm = signal<string>('');

  // ✅ AUTOMATIC MEMOIZATION with computed signals
  filteredItems = computed(() => {
    return this.items()
      .filter((item) => item.name.toLowerCase().includes(this.searchTerm().toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  trackByItemId(index: number, item: Item): number {
    return item.id;
  }
}
```

**When to memoize:**

- Filtering/sorting large arrays
- Complex calculations in templates
- Transforming data structures
- Expensive computations (loops, recursion)

**When NOT to memoize:**

- Simple string concatenation
- Basic arithmetic
- Premature optimization (profile first!)

---

## trackBy for \*ngFor Performance

### The Problem

```typescript
// ❌ AVOID - Angular recreates ALL DOM elements on data changes
@Component({
  template: `
    <div *ngFor="let user of users">
      {{ user.name }}
    </div>
  `,
})
export class UserListComponent {
  @Input() users: User[] = [];
}
```

### The Solution

```typescript
// ✅ CORRECT - Angular only updates changed items
@Component({
  template: `
    <div *ngFor="let user of users; trackBy: trackByUserId">
      {{ user.name }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  @Input() users: User[] = [];

  trackByUserId(index: number, user: User): number {
    return user.id; // Stable unique identifier
  }
}
```

**When to use trackBy:**

- **ALWAYS** use it for lists with \*ngFor
- Especially for lists that can change (add, remove, reorder)
- Lists with complex child components
- Lists fetched from APIs

**TrackBy function patterns:**

```typescript
// Simple ID tracking
trackById(index: number, item: any): number {
  return item.id;
}

// Index tracking (only if items never reorder)
trackByIndex(index: number): number {
  return index;
}

// Composite key
trackByComposite(index: number, item: any): string {
  return `${item.id}-${item.version}`;
}
```

---

## Debounced Search with RxJS

### Basic Debounce Pattern

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { ApiUserService } from '@ai-nx-starter/api-client';

@Component({
  selector: 'app-search',
  template: `
    <input nz-input [formControl]="searchControl" placeholder="Search users..." />
    <div *ngFor="let user of users; trackBy: trackByUserId">
      {{ user.name }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  users: User[] = [];
  private destroy$ = new Subject<void>();

  constructor(private apiUserService: ApiUserService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value changed
        switchMap((searchTerm) => this.apiUserService.search(searchTerm || '')),
        takeUntil(this.destroy$),
      )
      .subscribe((users) => {
        this.users = users;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
```

**Optimal Debounce Timing:**

- **300-500ms**: Search/filtering
- **1000ms**: Auto-save
- **100-200ms**: Real-time validation

---

## Memory Leak Prevention

### The takeUntil Pattern (Standard)

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-component',
  template: `<div>{{ count }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponent implements OnInit, OnDestroy {
  count = 0;
  private destroy$ = new Subject<void>();

  constructor(private someService: SomeService) {}

  ngOnInit(): void {
    // ✅ CORRECT - Cleanup with takeUntil
    this.someService.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.count = data.count;
    });

    // ✅ Multiple subscriptions all cleaned up
    this.someService.updates$.pipe(takeUntil(this.destroy$)).subscribe((update) => {
      console.log('Update:', update);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### The takeUntilDestroyed Pattern (Angular 16+, Preferred)

```typescript
import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-my-component',
  template: `<div>{{ count }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponent implements OnInit {
  count = 0;

  constructor(private someService: SomeService) {
    // ✅ PREFERRED - Automatic cleanup, no ngOnDestroy needed!
    this.someService.data$.pipe(takeUntilDestroyed()).subscribe((data) => {
      this.count = data.count;
    });
  }

  ngOnInit(): void {
    // Also works in ngOnInit if takeUntilDestroyed is in constructor
  }
}
```

### Cleanup Timeouts/Intervals

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-timer',
  template: `<div>{{ count }}</div>`,
})
export class TimerComponent implements OnInit, OnDestroy {
  count = 0;
  private intervalId?: number;
  private timeoutId?: number;

  ngOnInit(): void {
    // ✅ CORRECT - Cleanup interval
    this.intervalId = window.setInterval(() => {
      this.count++;
    }, 1000);

    // ✅ CORRECT - Cleanup timeout
    this.timeoutId = window.setTimeout(() => {
      console.log('Delayed action');
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
```

### Cleanup Event Listeners

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-window-listener',
  template: `<div>{{ windowWidth }}</div>`,
})
export class WindowListenerComponent implements OnInit, OnDestroy {
  windowWidth = 0;
  private handleResize = () => {
    this.windowWidth = window.innerWidth;
  };

  ngOnInit(): void {
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    // ✅ CORRECT - Cleanup event listener
    window.removeEventListener('resize', this.handleResize);
  }
}
```

---

## Form Performance

### Avoid valueChanges on Entire Form

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-my-form',
  template: `
    <form [formGroup]="form">
      <input nz-input formControlName="username" />
      <input nz-input formControlName="email" />
      <input nz-input formControlName="password" />

      <p>Username: {{ username }}</p>
    </form>
  `,
})
export class MyFormComponent implements OnInit {
  form: FormGroup;
  username = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: [''],
      email: [''],
      password: [''],
    });
  }

  ngOnInit(): void {
    // ❌ AVOID - Triggers on ANY form field change
    this.form.valueChanges.subscribe((values) => {
      this.username = values.username;
    });

    // ✅ CORRECT - Watch only the field you need
    this.form.get('username')?.valueChanges.subscribe((value) => {
      this.username = value;
    });
  }
}
```

### Disable Change Detection During Updates

```typescript
import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-bulk-update',
  template: `<div>{{ items.length }} items</div>`,
})
export class BulkUpdateComponent {
  items: Item[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  addManyItems(newItems: Item[]): void {
    // ✅ Detach change detection for bulk updates
    this.cdr.detach();

    newItems.forEach((item) => {
      this.items.push(item);
    });

    // Reattach and trigger single change detection
    this.cdr.reattach();
    this.cdr.markForCheck();
  }
}
```

---

## List Rendering Optimization

### Immutable Data Patterns

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-list',
  template: `
    <button (click)="addUser()">Add User</button>
    <div *ngFor="let user of users; trackBy: trackByUserId">
      {{ user.name }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  users: User[] = [];

  addUser(): void {
    // ❌ AVOID - Mutates array, OnPush won't detect change
    this.users.push({ id: Date.now(), name: 'New User' });

    // ✅ CORRECT - Creates new array reference, OnPush detects
    this.users = [...this.users, { id: Date.now(), name: 'New User' }];
  }

  removeUser(userId: number): void {
    // ✅ CORRECT - Creates new array
    this.users = this.users.filter((u) => u.id !== userId);
  }

  updateUser(userId: number, name: string): void {
    // ✅ CORRECT - Creates new array with updated object
    this.users = this.users.map((u) => (u.id === userId ? { ...u, name } : u));
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
```

### Virtual Scrolling for Large Lists

```typescript
import { Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-large-list',
  standalone: true,
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items; trackBy: trackByItemId" class="item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [
    `
      .viewport {
        height: 400px;
        border: 1px solid #ccc;
      }
      .item {
        height: 50px;
      }
    `,
  ],
})
export class LargeListComponent {
  items = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  trackByItemId(index: number, item: any): number {
    return item.id;
  }
}
```

**When to use virtual scrolling:**

- Lists with 100+ items
- Infinite scroll implementations
- Tables with many rows
- Performance-critical lists

---

## Lazy Loading Modules and Components

### Lazy Load Feature Modules

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'admin',
    // ✅ Lazy load entire feature module
    loadChildren: () => import('./features/admin/admin-routing.module').then((m) => m.AdminRoutingModule),
  },
  {
    path: 'users',
    // ✅ Lazy load standalone component
    loadComponent: () => import('./features/users/user-list.component').then((m) => m.UserListComponent),
  },
];
```

### Lazy Load Heavy Libraries

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-export',
  template: `
    <button (click)="exportPDF()">Export PDF</button>
    <button (click)="exportExcel()">Export Excel</button>
  `,
})
export class ExportComponent {
  // ❌ AVOID - Import heavy libraries at top level
  // import { jsPDF } from 'jspdf';  // Large library loaded immediately

  async exportPDF(): Promise<void> {
    // ✅ CORRECT - Dynamic import when needed
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    // Use it
  }

  async exportExcel(): Promise<void> {
    // ✅ CORRECT - Dynamic import when needed
    const XLSX = await import('xlsx');
    // Use it
  }
}
```

---

## Pipe Performance

### Pure vs Impure Pipes

```typescript
import { Pipe, PipeTransform } from '@angular/core';

// ✅ DEFAULT - Pure pipe (only runs when input reference changes)
@Pipe({
  name: 'filterItems',
  // pure: true  // Default
})
export class FilterItemsPipe implements PipeTransform {
  transform(items: Item[], searchTerm: string): Item[] {
    return items.filter((item) => item.name.includes(searchTerm));
  }
}

// ❌ AVOID - Impure pipe (runs on EVERY change detection)
@Pipe({
  name: 'filterItems',
  pure: false, // EXPENSIVE!
})
export class FilterItemsImpurePipe implements PipeTransform {
  transform(items: Item[], searchTerm: string): Item[] {
    return items.filter((item) => item.name.includes(searchTerm));
  }
}
```

**When to use pure pipes (default):**

- **ALWAYS** unless you have a specific reason
- Transformation of primitive values
- Filtering/sorting arrays (if array reference changes)

**When to use impure pipes (rare):**

- Need to detect changes in mutable objects
- Working with non-Observable async data
- Truly dynamic transformations

---

## Bundle Size Optimization

### Tree Shaking with Named Imports

```typescript
// ❌ AVOID - Imports entire library
import * as _ from 'lodash';

const result = _.debounce(fn, 300);

// ✅ CORRECT - Tree-shakable named imports
import { debounce } from 'lodash-es';

const result = debounce(fn, 300);
```

### Lazy Load NG-ZORRO Components

```typescript
// ❌ AVOID - Import all NG-ZORRO modules
import { NgZorroAntdModule } from 'ng-zorro-antd';

// ✅ CORRECT - Import only what you need
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageModule } from 'ng-zorro-antd/message';
```

---

## Summary

**Performance Checklist:**

- ✅ **OnPush change detection** for all components (most important!)
- ✅ **trackBy functions** for all \*ngFor loops
- ✅ **Computed signals** or memoized getters for expensive calculations
- ✅ **Debounce search/filter** with RxJS (300-500ms)
- ✅ **takeUntilDestroyed** or takeUntil for subscription cleanup
- ✅ **Watch specific form fields** (not entire form)
- ✅ **Immutable data patterns** (create new references)
- ✅ **Virtual scrolling** for large lists (100+ items)
- ✅ **Lazy load** modules and components
- ✅ **Dynamic imports** for heavy libraries
- ✅ **Pure pipes** by default
- ✅ **Named imports** for tree shaking

**See Also:**

- [component-patterns-guide.md](component-patterns-guide.md) - OnPush and lazy loading
- [data-fetching-guide.md](data-fetching-guide.md) - RxJS optimization
- [routing-guide.md](routing-guide.md) - Route lazy loading
