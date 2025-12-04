# Frontend Logging - Angular & LoggerService

Complete guide to console-based logging in Angular frontend applications.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Usage Pattern](#usage-pattern)
- [Log Levels](#log-levels)
- [Log Format](#log-format)
- [Best Practices](#best-practices)
- [Testing with Loggers](#testing-with-loggers)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

---

## Overview

Frontend logging uses a custom **LoggerService** with console-based output and level filtering.

**Key Benefits:**

- ✅ Environment-aware log level filtering
- ✅ Consistent log format across the application
- ✅ Easy to mock for testing
- ✅ Production log suppression
- ✅ Browser DevTools integration

**Location:** `apps/web-ui/src/app/core/services/logger.service.ts`

---

## Configuration

### Log Level Enum

Location: `apps/web-ui/src/app/core/services/log-level.enum.ts`

```typescript
export enum LogLevel {
  None = 0, // No logging
  Error = 1, // Only errors
  Warn = 2, // Errors and warnings
  Info = 3, // Errors, warnings, and info
  Debug = 4, // All logs including debug
}
```

### Environment Configuration

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  logLevel: LogLevel.Debug, // All logs in dev
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  logLevel: LogLevel.Error, // Only errors in prod
};
```

---

## Usage Pattern

### Component Example

```typescript
import { Component, OnInit } from '@angular/core';
import { LoggerService } from '@app/core/services';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
})
export class ExampleComponent implements OnInit {
  constructor(private logger: LoggerService) {}

  ngOnInit() {
    this.logger.debug('Component initialized', { componentName: 'ExampleComponent' });
    this.loadData();
  }

  loadData() {
    this.logger.info('Loading data...');

    this.apiService.getData().subscribe({
      next: (data) => {
        this.logger.debug('Data loaded', data);
      },
      error: (error) => {
        this.logger.error('Failed to load data', error);
      },
    });
  }

  onSubmit(form: FormGroup) {
    if (!form.valid) {
      this.logger.warn('Form validation failed', form.errors);
      return;
    }

    this.logger.info('Form submitted', form.value);
  }
}
```

### Service Example

```typescript
import { Injectable } from '@angular/core';
import { LoggerService } from '@app/core/services';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(
    private logger: LoggerService,
    private http: HttpClient,
  ) {}

  fetchData(): Observable<Data[]> {
    this.logger.debug('Fetching data from API');

    return this.http.get<Data[]>('/api/data').pipe(
      tap((data) => this.logger.info('Data fetched successfully', { count: data.length })),
      catchError((error) => {
        this.logger.error('Failed to fetch data', error);
        return throwError(() => error);
      }),
    );
  }
}
```

---

## Log Levels

| Level   | When to Use                              | Example                                |
| ------- | ---------------------------------------- | -------------------------------------- |
| `debug` | Component lifecycle, detailed state      | ngOnInit, form state changes           |
| `info`  | User interactions, successful operations | Button clicks, data loaded             |
| `warn`  | Deprecated features, validation issues   | Old API usage, missing optional fields |
| `error` | API failures, exceptions                 | Network errors, unhandled exceptions   |

**Production Behavior:**

- `LogLevel.Error` → Only `error()` logs appear
- `LogLevel.Debug` → All logs appear (development only)

---

## Log Format

All frontend logs follow this format:

```
[LEVEL] message ...additionalArgs
```

### Examples

```
[DEBUG] Component initialized { componentName: 'ExampleComponent' }
[INFO] User logged in successfully
[WARN] Deprecated API endpoint used
[ERROR] Failed to load data Error: Network timeout
```

---

## Best Practices

### ✅ DO

```typescript
// Log component lifecycle events
this.logger.debug('Component initialized');
this.logger.debug('Component destroyed');

// Log user interactions
this.logger.info('User clicked submit button');
this.logger.info('User navigated to settings');

// Log API calls
this.logger.debug('API request', { endpoint, params });
this.logger.info('API response received', { data });

// Log errors with context
this.logger.error('API call failed', { endpoint, error });

// Log state changes
this.logger.debug('Form state changed', { valid: form.valid, value: form.value });
```

### ❌ DON'T

```typescript
// Don't use console methods directly
console.log('Debug info'); // ❌

// Don't log excessively in production
this.logger.debug('Detailed state', hugeObject); // ❌ Filtered anyway

// Don't log sensitive user data
this.logger.info('User password', password); // ❌ Security risk

// Don't log without context
this.logger.info('Success'); // ❌ What succeeded?

// Don't log in tight loops
for (const item of items) {
  this.logger.debug('Processing', item); // ❌ Performance
}
```

---

## Testing with Loggers

### Component Test

```typescript
describe('ExampleComponent', () => {
  let component: ExampleComponent;
  let logger: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleComponent],
      providers: [
        {
          provide: LoggerService,
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    });

    component = TestBed.createComponent(ExampleComponent).componentInstance;
    logger = TestBed.inject(LoggerService);
  });

  it('should log initialization', () => {
    component.ngOnInit();
    expect(logger.debug).toHaveBeenCalledWith('Component initialized', expect.any(Object));
  });

  it('should log form submission', () => {
    const form = new FormGroup({});
    component.onSubmit(form);
    expect(logger.info).toHaveBeenCalledWith('Form submitted', expect.any(Object));
  });
});
```

### Service Test

```typescript
describe('DataService', () => {
  let service: DataService;
  let logger: LoggerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DataService,
        {
          provide: LoggerService,
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(DataService);
    logger = TestBed.inject(LoggerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should log successful data fetch', () => {
    service.fetchData().subscribe();

    const req = httpMock.expectOne('/api/data');
    req.flush([{ id: 1 }]);

    expect(logger.debug).toHaveBeenCalledWith('Fetching data from API');
    expect(logger.info).toHaveBeenCalledWith('Data fetched successfully', { count: 1 });
  });

  it('should log fetch error', () => {
    service.fetchData().subscribe({
      error: () => {
        expect(logger.error).toHaveBeenCalledWith('Failed to fetch data', expect.any(Object));
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.error(new ErrorEvent('Network error'));
  });
});
```

---

## Migration Guide

### From console to LoggerService

```typescript
// ❌ Before
console.log('Component loaded');
console.error('Error:', error);
console.warn('Deprecated method');

// ✅ After
constructor(private logger: LoggerService) {}

this.logger.info('Component loaded');
this.logger.error('Error occurred', error);
this.logger.warn('Deprecated method used');
```

### Migration Checklist

1. ✅ Inject `LoggerService` in constructor
2. ✅ Replace `console.log` with `logger.info`
3. ✅ Replace `console.error` with `logger.error`
4. ✅ Replace `console.warn` with `logger.warn`
5. ✅ Replace `console.debug` with `logger.debug`
6. ✅ Add context to all log messages
7. ✅ Update tests to mock `LoggerService`

---

## Troubleshooting

### Logs not appearing in development

**Check:**

1. `environment.logLevel` is set to `LogLevel.Debug`
2. `LoggerService` is properly injected
3. Browser console filter is not hiding logs

**Solution:**

```typescript
// environment.ts
export const environment = {
  production: false,
  logLevel: LogLevel.Debug, // Shows all logs
};
```

### Too many logs in development

**Problem:** Console cluttered with debug logs

**Solution:**

```typescript
// Temporarily set to Info level
logLevel: LogLevel.Info, // Hides debug logs
```

### Logs appearing in production

**Problem:** Debug/info logs visible in production

**Solution:**

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  logLevel: LogLevel.Error, // Only errors
};
```

### Sensitive data in logs

**Problem:** User data appearing in console

**Solutions:**

1. Never log passwords, tokens, or PII
2. Audit all log statements before deployment
3. Use log level filtering (production = Error only)
4. Sanitize data before logging

**Example:**

```typescript
// ❌ Don't log sensitive data
this.logger.info('User details', { password, creditCard });

// ✅ Log safely
this.logger.info('User logged in', { userId: user.id });
```

---

**Related Files:**

- Frontend skill SKILL.md (to be created)
- Component patterns guide (to be created)
- Service patterns guide (to be created)

**References:**

- Service: `apps/web-ui/src/app/core/services/logger.service.ts`
- Enum: `apps/web-ui/src/app/core/services/log-level.enum.ts`
- Environment: `apps/web-ui/src/environments/environment.ts`
