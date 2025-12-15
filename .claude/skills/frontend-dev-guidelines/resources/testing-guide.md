# Testing Guide - Frontend Testing Strategies

Complete guide to testing Angular components, services, and features with Jest and Angular Testing utilities.

## Table of Contents

- [What to Test](#what-to-test)
- [Testing Components](#testing-components)
- [Testing Services](#testing-services)
- [Testing Guards](#testing-guards)
- [Testing Pipes](#testing-pipes)
- [Testing Directives](#testing-directives)
- [Testing with RxJS](#testing-with-rxjs)
- [Testing NG-ZORRO Components](#testing-ng-zorro-components)
- [Coverage Targets](#coverage-targets)
- [Quick Reference](#quick-reference)

---

## What to Test

### Decision Matrix

| Code Type                        | Action              | Reasoning                                  | Example                      |
| -------------------------------- | ------------------- | ------------------------------------------ | ---------------------------- |
| **Smart Components**             | ✅ Write tests      | Business logic, data fetching, state       | `user-list.component.ts`     |
| **Form Components**              | ✅ Write tests      | Validation, user input, submit logic       | `user-form.component.ts`     |
| **Services with State**          | ✅ Write tests      | State management with BehaviorSubject      | `users.service.ts`           |
| **Route Guards**                 | ✅ Write tests      | Authentication/authorization logic         | `auth.guard.ts`              |
| **Pipes (Custom)**               | ✅ Write tests      | Data transformation logic                  | `format-date.pipe.ts`        |
| **Directives (Custom)**          | ✅ Write tests      | DOM manipulation, custom behavior          | `click-outside.directive.ts` |
| **Event Bus/PubSub Services**    | ✅ Write tests      | Critical for cross-component communication | `event-bus.service.ts`       |
| **Interceptors**                 | ✅ Write tests      | HTTP request/response handling             | `auth.interceptor.ts`        |
| **Dumb/Presentation Components** | ⚠️ Optional tests   | Simple @Input/@Output, minimal logic       | `user-avatar.component.ts`   |
| **Module Declarations**          | ❌ Already excluded | Configuration only                         | `*.module.ts`                |
| **Routing Configuration**        | ❌ Already excluded | Route definitions                          | `app.routes.ts`              |

### Testing Policy

When creating new frontend features:

- ✅ **Automatically write tests** for smart components, forms, services, guards
- ✅ Run `npx nx test web-ui` to verify all pass
- ✅ Run `npx nx test web-ui --coverage` to check completeness
- ❌ **Don't wait to be asked** - tests are part of the workflow

---

## Testing Components

### Test Structure

```typescript
// user-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UsersService } from '../../services/users.service';
import { ClientUserDto, Role } from '@ai-nx-starter/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ChangeDetectorRef } from '@angular/core';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockMessageService: jest.Mocked<NzMessageService>;

  const mockUsers: ClientUserDto[] = [
    {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: Role.Admin,
      createdAt: new Date(),
    },
    {
      id: 'user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: Role.User,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockUsersService = {
      getUsers: jest.fn(),
      deleteUser: jest.fn(),
      loading$: of(false),
    } as any;

    mockMessageService = {
      success: jest.fn(),
      error: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: NzMessageService, useValue: mockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load users on init', () => {
      mockUsersService.getUsers.mockReturnValue(of(mockUsers));

      fixture.detectChanges(); // Triggers ngOnInit

      expect(mockUsersService.getUsers).toHaveBeenCalled();
      expect(component.users).toEqual(mockUsers);
    });

    it('should handle loading state', (done) => {
      mockUsersService.loading$ = of(true);
      mockUsersService.getUsers.mockReturnValue(of(mockUsers));

      fixture.detectChanges();

      mockUsersService.loading$.subscribe((loading) => {
        expect(loading).toBe(true);
        done();
      });
    });
  });

  describe('Delete User', () => {
    beforeEach(() => {
      component.users = [...mockUsers];
    });

    it('should delete user successfully', () => {
      mockUsersService.deleteUser.mockReturnValue(of(undefined));

      component.deleteUser('user-1');

      expect(mockUsersService.deleteUser).toHaveBeenCalledWith('user-1');
      expect(mockMessageService.success).toHaveBeenCalledWith(expect.stringContaining('deleted'));
    });

    it('should show error message when delete fails', () => {
      const error = new Error('Delete failed');
      mockUsersService.deleteUser.mockReturnValue(throwError(() => error));

      component.deleteUser('user-1');

      expect(mockMessageService.error).toHaveBeenCalledWith(expect.stringContaining('Failed'));
    });
  });

  describe('Template Integration', () => {
    it('should display users in table', () => {
      mockUsersService.getUsers.mockReturnValue(of(mockUsers));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const rows = compiled.querySelectorAll('tbody tr');

      expect(rows.length).toBe(2);
    });

    it('should show loading spinner when loading', () => {
      mockUsersService.loading$ = of(true);
      mockUsersService.getUsers.mockReturnValue(of([]));
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const spinner = compiled.querySelector('nz-spin');

      expect(spinner).toBeTruthy();
    });
  });
});
```

### What to Test in Components

✅ **Test these**:

- Component initialization and lifecycle hooks
- Data fetching and loading states
- User interactions (click, input, form submit)
- @Input() changes and @Output() emissions
- Navigation and routing
- Error handling and error messages
- Template rendering with different data states

❌ **Don't test these**:

- Angular framework internals (change detection itself)
- NG-ZORRO component internals (they're tested by NG-ZORRO)
- CSS styling (use visual regression testing tools instead)
- External library behavior (trust the libraries)

---

## Testing Services

### Service with API Calls

```typescript
// users.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UsersService } from './users.service';
import { ApiUserService } from '@ai-nx-starter/api-client';
import { ClientUserDto, Role } from '@ai-nx-starter/types';

describe('UsersService', () => {
  let service: UsersService;
  let apiUserService: jest.Mocked<ApiUserService>;

  const mockUser: ClientUserDto = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    role: Role.Admin,
    createdAt: new Date(),
  };

  beforeEach(() => {
    const mockApiUserService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [UsersService, { provide: ApiUserService, useValue: mockApiUserService }],
    });

    service = TestBed.inject(UsersService);
    apiUserService = TestBed.inject(ApiUserService) as jest.Mocked<ApiUserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should get all users', (done) => {
      const users = [mockUser];
      apiUserService.findAll.mockReturnValue(of(users));

      service.getUsers().subscribe((result) => {
        expect(result).toEqual(users);
        expect(apiUserService.findAll).toHaveBeenCalled();
        done();
      });
    });

    it('should set loading state during fetch', (done) => {
      apiUserService.findAll.mockReturnValue(of([mockUser]));

      const loadingStates: boolean[] = [];

      service.loading$.subscribe((loading) => {
        loadingStates.push(loading);
      });

      service.getUsers().subscribe(() => {
        expect(loadingStates).toContain(true); // Was loading
        expect(loadingStates[loadingStates.length - 1]).toBe(false); // Finished loading
        done();
      });
    });

    it('should handle errors', (done) => {
      const error = new Error('API Error');
      apiUserService.findAll.mockReturnValue(throwError(() => error));

      service.getUsers().subscribe({
        next: () => fail('Should have errored'),
        error: (err) => {
          expect(err).toBe(error);
          done();
        },
      });
    });
  });

  describe('State Management with BehaviorSubject', () => {
    it('should update users$ observable when users change', (done) => {
      const users = [mockUser];
      apiUserService.findAll.mockReturnValue(of(users));

      service.getUsers().subscribe();

      service.users$.subscribe((result) => {
        expect(result).toEqual(users);
        done();
      });
    });

    it('should expose synchronous getter for users', () => {
      const users = [mockUser];
      service['_users$'].next(users); // Access private BehaviorSubject

      expect(service.users).toEqual(users);
    });
  });

  describe('Cache Management', () => {
    it('should not refetch if cache is fresh', () => {
      const users = [mockUser];
      apiUserService.findAll.mockReturnValue(of(users));

      service.getUsers().subscribe(); // First call
      service.getUsers().subscribe(); // Second call (should use cache)

      // Should only be called once if caching is implemented
      expect(apiUserService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should refetch when forced', () => {
      const users = [mockUser];
      apiUserService.findAll.mockReturnValue(of(users));

      service.getUsers().subscribe();
      service.getUsers(true).subscribe(); // Force refresh

      expect(apiUserService.findAll).toHaveBeenCalledTimes(2);
    });
  });
});
```

### What to Test in Services

✅ **Test these**:

- API calls with correct parameters
- State management (BehaviorSubject updates)
- Loading states
- Error handling
- Cache invalidation
- Data transformations
- Observable emissions

❌ **Don't test these**:

- Auto-generated API client internals (trust the generator)
- RxJS operators themselves (trust RxJS)
- TypeScript type checking (handled by compiler)

---

## Testing Guards

### Route Guard Testing

```typescript
// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { UiAppContextService } from '../services/ui-app-context.service';

describe('authGuard', () => {
  let uiAppContextService: jest.Mocked<UiAppContextService>;
  let router: jest.Mocked<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const mockUiAppContextService = {
      isAuthenticated: jest.fn(),
      currentUser: null,
    };

    const mockRouter = {
      navigate: jest.fn(),
      createUrlTree: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: UiAppContextService, useValue: mockUiAppContextService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    uiAppContextService = TestBed.inject(UiAppContextService) as jest.Mocked<UiAppContextService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/dashboard' } as RouterStateSnapshot;
  });

  describe('Authentication Check', () => {
    it('should allow access when user is authenticated', () => {
      uiAppContextService.isAuthenticated.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() => authGuard(route, state));

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not authenticated', () => {
      uiAppContextService.isAuthenticated.mockReturnValue(false);
      const urlTree = {} as any;
      router.createUrlTree.mockReturnValue(urlTree);

      const result = TestBed.runInInjectionContext(() => authGuard(route, state));

      expect(result).toBe(urlTree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    });

    it('should preserve return URL when redirecting to login', () => {
      uiAppContextService.isAuthenticated.mockReturnValue(false);
      const urlTree = {} as any;
      router.createUrlTree.mockReturnValue(urlTree);

      TestBed.runInInjectionContext(() => authGuard(route, state));

      expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    });
  });
});
```

### Role-Based Guard Testing

```typescript
// role.guard.spec.ts
describe('roleGuard', () => {
  let uiAppContextService: jest.Mocked<UiAppContextService>;
  let router: jest.Mocked<Router>;

  beforeEach(() => {
    // Setup similar to authGuard
  });

  it('should allow access when user has required role', () => {
    route.data = { role: 'admin' };
    uiAppContextService.hasRole.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(true);
    expect(uiAppContextService.hasRole).toHaveBeenCalledWith('admin');
  });

  it('should deny access when user lacks required role', () => {
    route.data = { role: 'admin' };
    uiAppContextService.hasRole.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should allow access when no role is required', () => {
    route.data = {};

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(true);
  });
});
```

---

## Testing Pipes

### Custom Pipe Testing

```typescript
// truncate.pipe.spec.ts
import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Text Truncation', () => {
    it('should truncate text longer than limit', () => {
      const result = pipe.transform('This is a very long text', 10);

      expect(result).toBe('This is a...');
    });

    it('should not truncate text shorter than limit', () => {
      const result = pipe.transform('Short', 10);

      expect(result).toBe('Short');
    });

    it('should handle empty string', () => {
      const result = pipe.transform('', 10);

      expect(result).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(pipe.transform(null as any, 10)).toBe('');
      expect(pipe.transform(undefined as any, 10)).toBe('');
    });

    it('should use custom suffix', () => {
      const result = pipe.transform('This is a very long text', 10, ' [more]');

      expect(result).toBe('This is a [more]');
    });
  });
});
```

---

## Testing Directives

### Custom Directive Testing

```typescript
// click-outside.directive.spec.ts
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  template: `
    <div class="container">
      <div class="inside" appClickOutside (clickOutside)="onClickOutside()">Inside</div>
    </div>
  `,
})
class TestComponent {
  clickedOutside = false;

  onClickOutside(): void {
    this.clickedOutside = true;
  }
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let insideElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClickOutsideDirective, TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    insideElement = fixture.debugElement.query(By.css('.inside'));
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = insideElement.injector.get(ClickOutsideDirective);
    expect(directive).toBeTruthy();
  });

  it('should emit clickOutside when clicking outside element', () => {
    const container = fixture.debugElement.query(By.css('.container'));

    container.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(true);
  });

  it('should not emit clickOutside when clicking inside element', () => {
    insideElement.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(false);
  });
});
```

---

## Testing with RxJS

### Testing Observables

```typescript
import { TestScheduler } from 'rxjs/testing';

describe('Data Stream Service', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should debounce search input', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const input$ = cold('   a-b-c-d-e-f|');
      const expected = '      ---c-----f-|';

      const result$ = input$.pipe(debounceTime(30));

      expectObservable(result$).toBe(expected, { c: 'c', f: 'f' });
    });
  });

  it('should combine latest values', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const users$ = cold('  a---b---|', { a: [1], b: [1, 2] });
      const filter$ = cold(' --f-----|', { f: 'test' });
      const expected = '     --x--y--|';

      const result$ = combineLatest([users$, filter$]).pipe(map(([u, f]) => ({ u, f })));

      expectObservable(result$).toBe(expected, {
        x: { u: [1], f: 'test' },
        y: { u: [1, 2], f: 'test' },
      });
    });
  });
});
```

### Testing with fakeAsync

```typescript
import { fakeAsync, tick } from '@angular/core/testing';

describe('Timer Service', () => {
  it('should emit after delay', fakeAsync(() => {
    let emitted = false;

    of(true)
      .pipe(delay(1000))
      .subscribe(() => (emitted = true));

    expect(emitted).toBe(false);

    tick(1000);

    expect(emitted).toBe(true);
  }));

  it('should debounce rapid clicks', fakeAsync(() => {
    let clickCount = 0;
    const clicks$ = new Subject<void>();

    clicks$.pipe(debounceTime(300)).subscribe(() => clickCount++);

    clicks$.next(); // Click 1
    tick(100);
    clicks$.next(); // Click 2
    tick(100);
    clicks$.next(); // Click 3
    tick(300); // Wait for debounce

    expect(clickCount).toBe(1); // Only last click counted
  }));
});
```

---

## Testing NG-ZORRO Components

### Testing Forms with NG-ZORRO

```typescript
// user-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFormComponent],
      imports: [ReactiveFormsModule, NzFormModule, NzInputModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Form Validation', () => {
    it('should mark email as invalid when format is wrong', () => {
      const emailControl = component.form.get('email');

      emailControl?.setValue('invalid-email');
      emailControl?.markAsDirty();

      expect(emailControl?.invalid).toBe(true);
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should mark email as valid when format is correct', () => {
      const emailControl = component.form.get('email');

      emailControl?.setValue('test@example.com');

      expect(emailControl?.valid).toBe(true);
    });

    it('should require firstName field', () => {
      const firstNameControl = component.form.get('firstName');

      firstNameControl?.setValue('');

      expect(firstNameControl?.hasError('required')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should not submit when form is invalid', () => {
      spyOn(component, 'createUser');

      component.form.patchValue({
        email: 'invalid',
        firstName: '',
      });

      component.onSubmit();

      expect(component.createUser).not.toHaveBeenCalled();
    });

    it('should submit when form is valid', () => {
      spyOn(component, 'createUser');

      component.form.patchValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      });

      component.onSubmit();

      expect(component.createUser).toHaveBeenCalled();
    });
  });
});
```

### Testing Tables with NG-ZORRO

```typescript
describe('User Table Component', () => {
  it('should display correct number of rows', () => {
    component.users = [mockUser1, mockUser2, mockUser3];
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows.length).toBe(3);
  });

  it('should sort users by name', () => {
    component.users = [
      { id: '1', firstName: 'Charlie', lastName: 'Brown' },
      { id: '2', firstName: 'Alice', lastName: 'Smith' },
      { id: '3', firstName: 'Bob', lastName: 'Jones' },
    ];

    component.sortByName();
    fixture.detectChanges();

    expect(component.users[0].firstName).toBe('Alice');
    expect(component.users[1].firstName).toBe('Bob');
    expect(component.users[2].firstName).toBe('Charlie');
  });

  it('should handle pagination', () => {
    const allUsers = Array.from({ length: 50 }, (_, i) => ({
      id: `user-${i}`,
      firstName: `User${i}`,
    }));

    component.users = allUsers;
    component.pageSize = 10;
    component.pageIndex = 1;
    fixture.detectChanges();

    const displayedUsers = component.getPagedUsers();

    expect(displayedUsers.length).toBe(10);
    expect(displayedUsers[0].id).toBe('user-0');
  });
});
```

### Testing Modals

```typescript
import { NzModalService } from 'ng-zorro-antd/modal';

describe('Component with Modal', () => {
  let modalService: jest.Mocked<NzModalService>;

  beforeEach(() => {
    modalService = {
      confirm: jest.fn(),
      create: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [{ provide: NzModalService, useValue: modalService }],
    });
  });

  it('should show confirmation modal before delete', () => {
    const mockConfirm = {
      afterClose: of(true),
    };
    modalService.confirm.mockReturnValue(mockConfirm as any);

    component.confirmDelete('user-123');

    expect(modalService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        nzTitle: expect.stringContaining('Delete'),
        nzContent: expect.any(String),
      }),
    );
  });

  it('should proceed with delete when user confirms', (done) => {
    const mockConfirm = {
      afterClose: of(true),
    };
    modalService.confirm.mockReturnValue(mockConfirm as any);
    spyOn(component, 'deleteUser');

    component.confirmDelete('user-123');

    mockConfirm.afterClose.subscribe(() => {
      expect(component.deleteUser).toHaveBeenCalledWith('user-123');
      done();
    });
  });

  it('should cancel delete when user cancels', (done) => {
    const mockConfirm = {
      afterClose: of(false),
    };
    modalService.confirm.mockReturnValue(mockConfirm as any);
    spyOn(component, 'deleteUser');

    component.confirmDelete('user-123');

    mockConfirm.afterClose.subscribe(() => {
      expect(component.deleteUser).not.toHaveBeenCalled();
      done();
    });
  });
});
```

---

## Coverage Targets

### Recommended Thresholds

- **Statements**: 80%
- **Lines**: 80%
- **Branches**: 60%
- **Functions**: 60%

### Run Coverage

```bash
# Run tests with coverage for web-ui
npx nx test web-ui --coverage

# Watch mode
npx nx test web-ui --watch

# Run specific test file
npx nx test web-ui --testFile=user-form.component.spec.ts
```

### Coverage Analysis

After running coverage, review the report:

1. **Identify untested files** - Look for 0% coverage
2. **Check if business logic** - Use decision matrix above
3. **Write tests or exclude** - Based on code type
4. **Re-run coverage** - Verify thresholds met

---

## Quick Reference

### Common Test Patterns

```typescript
// Testing OnPush components - use fixture.detectChanges()
component.data = newData;
fixture.detectChanges(); // Trigger change detection
expect(fixture.nativeElement.textContent).toContain('expected');

// Testing async data with done callback
service.getData().subscribe((result) => {
  expect(result).toEqual(expected);
  done();
});

// Testing async with fakeAsync
it('should handle delay', fakeAsync(() => {
  let result = false;
  setTimeout(() => (result = true), 1000);
  tick(1000);
  expect(result).toBe(true);
}));

// Testing Observable errors
service.getData().subscribe({
  next: () => fail('Should have errored'),
  error: (err) => {
    expect(err).toBeTruthy();
    done();
  },
});

// Testing BehaviorSubject state changes
const states: boolean[] = [];
service.loading$.subscribe((loading) => states.push(loading));
service.loadData();
expect(states).toEqual([false, true, false]);
```

### Common Mocks

```typescript
// Mock ActivatedRoute
const mockActivatedRoute = {
  params: of({ id: '123' }),
  queryParams: of({ filter: 'active' }),
  snapshot: {
    params: { id: '123' },
    queryParams: { filter: 'active' },
    data: { title: 'Users' },
  },
};

// Mock Router
const mockRouter = {
  navigate: jest.fn(),
  navigateByUrl: jest.fn(),
  createUrlTree: jest.fn(),
  url: '/users',
};

// Mock NzMessageService
const mockMessageService = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
};

// Mock Auto-generated API Service
const mockApiUserService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
```

### Test Naming Conventions

```typescript
describe('ComponentName or ServiceName', () => {
  describe('methodName or Feature', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = component.transform(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

---

## Summary

**Frontend Testing Recipe:**

1. **Test smart components** - Business logic, data fetching, user interactions
2. **Test services** - API calls, state management, caching
3. **Test guards** - Authentication and authorization logic
4. **Test custom pipes/directives** - Data transformation and DOM manipulation
5. **Mock dependencies** - Use jest.fn() for all external dependencies
6. **Use TestBed** - Configure Angular testing module properly
7. **Coverage targets** - Aim for 80% statements/lines, 60% branches/functions
8. **OnPush detection** - Call fixture.detectChanges() when testing OnPush components
9. **RxJS testing** - Use done callbacks, fakeAsync, or TestScheduler
10. **NG-ZORRO mocking** - Mock NzMessageService, NzModalService, etc.

**See Also:**

- [component-patterns-guide.md](component-patterns-guide.md) - Component architecture
- [data-fetching-guide.md](data-fetching-guide.md) - API client and RxJS patterns
- [common-patterns-guide.md](common-patterns-guide.md) - Forms, tables, guards
- [performance-guide.md](performance-guide.md) - OnPush change detection
