# TypeScript Standards

TypeScript best practices for type safety and maintainability in Angular frontend code.

---

## Strict Mode

### Configuration

TypeScript strict mode is **enabled** in the project:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true
  }
}
```

**This means:**

- No implicit `any` types
- Null/undefined must be handled explicitly
- Type safety enforced
- Class properties must be initialized

---

## No `any` Type

### The Rule

```typescript
// ❌ NEVER use any
function handleData(data: any) {
  return data.something;
}

// ✅ Use specific types
interface MyData {
  something: string;
}

function handleData(data: MyData): string {
  return data.something;
}

// ✅ Or use unknown for truly unknown data
function handleUnknown(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'something' in data) {
    return (data as MyData).something;
  }
  return undefined;
}
```

**If you truly don't know the type:**

- Use `unknown` (forces type checking)
- Use type guards to narrow
- Document why type is unknown

---

## Explicit Return Types

### Function and Method Return Types

```typescript
// ✅ CORRECT - Explicit return type
function getUser(id: string): Observable<ClientUserDto> {
  return this.apiUserService.getUser(id);
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ AVOID - Implicit return type (less clear)
function getUser(id: string) {
  return this.apiUserService.getUser(id);
}
```

### Component Method Return Types

```typescript
@Component({
  /* ... */
})
export class MyComponent {
  // ✅ CORRECT - Explicit void return type
  loadUsers(): void {
    this.apiUserService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }

  // ✅ CORRECT - Explicit return type
  getUserName(userId: string): string {
    const user = this.users.find((u) => u.id === userId);
    return user?.name || 'Unknown';
  }

  // ✅ CORRECT - Observable return type
  searchUsers(term: string): Observable<ClientUserDto[]> {
    return this.apiUserService.search(term);
  }
}
```

---

## Type Imports

### Use 'type' Keyword

```typescript
// ✅ CORRECT - Explicitly mark as type import
import type { ClientUserDto, CreateUserDto } from '@ai-nx-starter/types';
import type { Observable } from 'rxjs';

// ❌ AVOID - Mixed value and type imports
import { ClientUserDto } from '@ai-nx-starter/types'; // Unclear if type or value
```

**Benefits:**

- Clearly separates types from values
- Better tree-shaking
- Prevents circular dependencies
- TypeScript compiler optimization

---

## Component Input/Output Types

### Input and Output Decorators

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { ClientUserDto } from '@ai-nx-starter/types';

/**
 * User display component
 */
@Component({
  selector: 'app-user-display',
  templateUrl: './user-display.component.html',
})
export class UserDisplayComponent {
  /** The user to display */
  @Input() user!: ClientUserDto;

  /** Optional display mode */
  @Input() mode: 'view' | 'edit' = 'view';

  /** Optional CSS class */
  @Input() className?: string;

  /** Emitted when user clicks the edit button */
  @Output() edit = new EventEmitter<string>();

  /** Emitted when action completes */
  @Output() complete = new EventEmitter<void>();

  onEditClick(): void {
    this.edit.emit(this.user.id);
  }
}
```

**Key Points:**

- JSDoc comments for each Input/Output
- Use `!` for required inputs (definite assignment assertion)
- Use `?` for optional inputs
- Provide default values for optional inputs
- EventEmitter with explicit type

### Input with Transform

```typescript
import { Component, Input, booleanAttribute, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-my-component',
  template: `<div>{{ count }}</div>`,
})
export class MyComponent {
  // ✅ Transform string to number
  @Input({ transform: numberAttribute }) count: number = 0;

  // ✅ Transform string to boolean
  @Input({ transform: booleanAttribute }) disabled: boolean = false;
}
```

---

## Utility Types

### Partial<T>

```typescript
// Make all properties optional
type UserUpdate = Partial<ClientUserDto>;

updateUser(id: string, updates: Partial<ClientUserDto>): Observable<ClientUserDto> {
  // updates can have any subset of ClientUserDto properties
  return this.apiUserService.update(id, updates);
}
```

### Pick<T, K>

```typescript
// Select specific properties
type UserPreview = Pick<ClientUserDto, 'id' | 'firstName' | 'lastName' | 'email'>;

const preview: UserPreview = {
  id: '123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  // Other ClientUserDto properties not allowed
};
```

### Omit<T, K>

```typescript
// Exclude specific properties
type UserWithoutPassword = Omit<CreateUserDto, 'password' | 'passwordHash'>;

const publicUser: UserWithoutPassword = {
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  // password and passwordHash not allowed
};
```

### Required<T>

```typescript
// Make all properties required
type RequiredConfig = Required<AppConfig>; // All optional props become required
```

### Record<K, V>

```typescript
// Type-safe object/map
const userMap: Record<string, ClientUserDto> = {
  user1: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  user2: { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
};

// For LESS style references
const styles: Record<string, string> = {
  container: 'user-list-container',
  header: 'user-header',
  table: 'user-table',
};
```

---

## Type Guards

### Basic Type Guards

```typescript
function isClientUserDto(data: unknown): data is ClientUserDto {
  return typeof data === 'object' && data !== null && 'id' in data && 'firstName' in data && 'lastName' in data && 'email' in data;
}

// Usage
if (isClientUserDto(response)) {
  console.log(response.firstName); // TypeScript knows it's ClientUserDto
}
```

### Discriminated Unions

```typescript
type LoadingState<T> = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: Error };

@Component({
  /* ... */
})
export class MyComponent {
  state: LoadingState<ClientUserDto[]> = { status: 'idle' };

  renderContent(): string {
    // TypeScript narrows type based on status
    if (this.state.status === 'success') {
      return `${this.state.data.length} users`; // data available here
    }

    if (this.state.status === 'error') {
      return `Error: ${this.state.error.message}`; // error available here
    }

    return 'Loading...';
  }
}
```

---

## Generic Types

### Generic Services

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CrudService<T> {
  constructor(private http: HttpClient) {}

  getAll(url: string): Observable<T[]> {
    return this.http.get<T[]>(url);
  }

  getById(url: string, id: string): Observable<T> {
    return this.http.get<T>(`${url}/${id}`);
  }

  create(url: string, item: T): Observable<T> {
    return this.http.post<T>(url, item);
  }

  update(url: string, id: string, item: Partial<T>): Observable<T> {
    return this.http.put<T>(`${url}/${id}`, item);
  }

  delete(url: string, id: string): Observable<void> {
    return this.http.delete<void>(`${url}/${id}`);
  }
}
```

### Generic Components

```typescript
import { Component, Input } from '@angular/core';

interface ListItem {
  id: string | number;
}

@Component({
  selector: 'app-generic-list',
  template: `
    <div *ngFor="let item of items; trackBy: trackById">
      <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item }"></ng-container>
    </div>
  `,
})
export class GenericListComponent<T extends ListItem> {
  @Input() items: T[] = [];
  @Input() itemTemplate!: TemplateRef<{ $implicit: T }>;

  trackById(index: number, item: T): string | number {
    return item.id;
  }
}
```

---

## Type Assertions (Use Sparingly)

### When to Use

```typescript
// ✅ OK - When you know more than TypeScript
const element = document.getElementById('my-input') as HTMLInputElement;
const value = element.value;

// ✅ OK - API response that you've validated
this.apiUserService.getUser(id).subscribe((response) => {
  const user = response as ClientUserDto; // You know the shape
});
```

### When NOT to Use

```typescript
// ❌ AVOID - Circumventing type safety
const data = getData() as any; // WRONG - defeats TypeScript

// ❌ AVOID - Unsafe assertion
const value = unknownValue as string; // Might not actually be string
```

---

## Null/Undefined Handling

### Optional Chaining

```typescript
// ✅ CORRECT
const name = user?.profile?.name;

// Equivalent to:
const name = user && user.profile && user.profile.name;

// In templates
<div>{{ user?.profile?.name }}</div>
```

### Nullish Coalescing

```typescript
// ✅ CORRECT
const displayName = user?.firstName ?? 'Anonymous';

// Only uses default if null or undefined
// (Different from || which triggers on '', 0, false)

// In templates
<div>{{ user?.firstName ?? 'Anonymous' }}</div>
```

### Non-Null Assertion (Use Carefully)

```typescript
// ✅ OK - When you're certain value exists
@Input() user!: ClientUserDto; // Required input, will be set by parent

// ⚠️ CAREFUL - Only use when you KNOW it's not null
const userId = this.route.snapshot.paramMap.get('id')!;

// Better to check explicitly:
const userId = this.route.snapshot.paramMap.get('id');
if (userId) {
  // Use userId
}
```

---

## Observable Types

### Explicitly Type Observables

```typescript
import type { Observable } from 'rxjs';
import type { ClientUserDto } from '@ai-nx-starter/types';

@Component({
  /* ... */
})
export class UserComponent {
  // ✅ CORRECT - Explicit Observable type
  users$: Observable<ClientUserDto[]>;

  constructor(private apiUserService: ApiUserService) {
    this.users$ = this.apiUserService.getUsers();
  }

  // ✅ CORRECT - Method returns typed Observable
  searchUsers(term: string): Observable<ClientUserDto[]> {
    return this.apiUserService.search(term);
  }
}
```

### BehaviorSubject Types

```typescript
import { BehaviorSubject, Observable } from 'rxjs';
import type { ClientUserDto } from '@ai-nx-starter/types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // ✅ CORRECT - Typed BehaviorSubject
  private usersSubject = new BehaviorSubject<ClientUserDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // ✅ Expose as Observable (read-only)
  users$: Observable<ClientUserDto[]> = this.usersSubject.asObservable();
  loading$: Observable<boolean> = this.loadingSubject.asObservable();
}
```

---

## Interface vs Type

### When to Use Interface

```typescript
// ✅ Use interface for object shapes (preferred)
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ✅ Interfaces can extend
interface AdminUser extends User {
  permissions: string[];
  role: 'admin' | 'superadmin';
}
```

### When to Use Type

```typescript
// ✅ Use type for unions
type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ Use type for complex types
type LoadingState<T> = { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: Error };

// ✅ Use type for utility types
type UserUpdate = Partial<User>;
type UserPreview = Pick<User, 'id' | 'firstName' | 'lastName'>;
```

**General Rule:**

- Use `interface` for object shapes
- Use `type` for unions, intersections, utilities

---

## Summary

**TypeScript Checklist:**

- ✅ Strict mode enabled
- ✅ No `any` type (use `unknown` if needed)
- ✅ Explicit return types on functions and methods
- ✅ Use `import type` for type imports
- ✅ JSDoc comments on Input/Output decorators
- ✅ Utility types (Partial, Pick, Omit, Required, Record)
- ✅ Type guards for narrowing
- ✅ Optional chaining and nullish coalescing
- ✅ Explicit Observable types
- ❌ Avoid type assertions unless necessary

**See Also:**

- [component-patterns-guide.md](component-patterns-guide.md) - Component typing
- [data-fetching-guide.md](data-fetching-guide.md) - API and Observable typing
