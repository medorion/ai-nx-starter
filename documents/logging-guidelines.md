# Logging Guidelines

Comprehensive logging standards for AI-Nx-Starter monorepo.

## Overview

This project uses structured logging across frontend and backend:

- **Backend (NestJS)**: Pino logger via `nestjs-pino` - JSON structured logs in production, pretty-printed in development
- **Frontend (Angular)**: Custom `LoggerService` - Console-based with level filtering

## Backend Logging (NestJS)

### Configuration

Location: `apps/web-server/src/app/app.module.ts:20-36`

```typescript
LoggerModule.forRoot({
  pinoHttp: {
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: { colorize: true, singleLine: true },
          }
        : undefined,
    level: process.env.LOG_LEVEL || 'info',
    autoLogging: false,
    redact: ['req.headers.authorization'],
  },
});
```

**Key Features**:

- **Development**: Colorized, single-line output via `pino-pretty`
- **Production**: Structured JSON logs for parsing/aggregation
- **Redaction**: Automatically hides sensitive headers
- **Level Control**: Set via `LOG_LEVEL` environment variable

### Usage Pattern

```typescript
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ExampleService {
  constructor(private readonly logger: PinoLogger) {
    // REQUIRED: Set context to class name for log traceability
    this.logger.setContext(ExampleService.name);
  }

  async performAction(userId: string) {
    // Info: User actions, successful operations
    this.logger.info(`Action started for user: ${userId}`);

    try {
      const result = await this.doSomething();

      // Debug: Development details, verbose data
      this.logger.debug('Processing result', { result, userId });

      return result;
    } catch (error) {
      // Error: Failures with stack trace
      this.logger.error(`Action failed for user ${userId}`, error.stack);
      throw error;
    }
  }

  validateInput(input: any) {
    if (!input.required) {
      // Warn: Recoverable issues, validation failures
      this.logger.warn(`Validation failed: missing required field`, { input });
      return false;
    }
    return true;
  }
}
```

### Log Levels

| Level   | When to Use                             | Example                                      |
| ------- | --------------------------------------- | -------------------------------------------- |
| `debug` | Development details, verbose data       | Request params, intermediate processing data |
| `info`  | User actions, successful operations     | Login success, record created, job completed |
| `warn`  | Recoverable issues, validation failures | Missing optional field, deprecated API usage |
| `error` | Failures, exceptions, critical errors   | Database errors, API failures, crashes       |

### Best Practices

✅ **DO**:

```typescript
// Include context in log messages
this.logger.info(`User logged in successfully: ${user.email}`);

// Log important state changes
this.logger.info(`Order status changed: ${orderId} from ${oldStatus} to ${newStatus}`);

// Include error context
this.logger.error(`Failed to process payment for order ${orderId}`, error.stack);

// Use debug for development details
this.logger.debug('Database query params', { query, params });
```

❌ **DON'T**:

```typescript
// Don't use console.log
console.log('User logged in'); // ❌

// Don't log without context
this.logger.info('Success'); // ❌ What succeeded?

// Don't forget to set context
constructor(private logger: PinoLogger) {} // ❌ Missing setContext

// Don't log sensitive data
this.logger.info(`Password: ${password}`); // ❌ Security risk
```

### Sensitive Data Redaction

**Always redact**:

- Passwords (plain or hashed)
- Full credit card numbers (PCI compliance)
- Social security numbers
- API keys and tokens (already redacted in headers)
- Personal health information

**Safe to log**:

- User emails (for audit trails)
- User IDs
- Entity IDs
- Timestamps
- Operation names
- Last 4 digits of cards (if needed)

### Real-World Examples

From `apps/web-server/src/app/auth/auth.service.ts`:

```typescript
export class AuthService {
  constructor(
    private readonly userDbService: UserDbService,
    private readonly sessionService: SessionService,
    private readonly authMapperService: AuthMapperService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async login(loginUserDto: LoginUserDto, userIp: string): Promise<ClientUserDto> {
    const user = await this.userDbService.findByEmail(loginUserDto.email);

    if (!user) {
      this.logger.warn(`Login attempt failed: user not found for email ${loginUserDto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.userDbService.verifyPassword(user.id, loginUserDto.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login attempt failed: invalid password for email ${loginUserDto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // ... create session ...

    this.logger.info(`User logged in successfully: ${user.email}`);
    return clientUser;
  }

  async logout(sessionToken: string, session: SessionInfo): Promise<void> {
    if (!session) {
      this.logger.warn('Logout attempt with no session');
      throw new AppErrorException('Session does not exist, must log in first');
    }

    await this.sessionService.killSessionByToken(sessionToken);
    this.logger.info(`User logged out successfully: ${session.email}`);
  }
}
```

## Frontend Logging (Angular)

### Service Location

`apps/web-ui/src/app/core/services/logger.service.ts`

### Configuration

Log levels are defined in `log-level.enum.ts`:

```typescript
export enum LogLevel {
  None = 0, // No logging
  Error = 1, // Only errors
  Warn = 2, // Errors and warnings
  Info = 3, // Errors, warnings, and info
  Debug = 4, // All logs including debug
}
```

Set in environment files:

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

### Usage Pattern

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

### Log Format

All frontend logs follow this format:

```
[LEVEL] message ...additionalArgs
```

Examples:

```
[DEBUG] Component initialized { componentName: 'ExampleComponent' }
[INFO] User logged in successfully
[WARN] Deprecated API endpoint used
[ERROR] Failed to load data Error: Network timeout
```

### Best Practices

✅ **DO**:

```typescript
// Log component lifecycle events
this.logger.debug('Component initialized');

// Log user interactions
this.logger.info('User clicked submit button');

// Log API calls
this.logger.debug('API request', { endpoint, params });

// Log errors with context
this.logger.error('API call failed', { endpoint, error });
```

❌ **DON'T**:

```typescript
// Don't use console methods directly
console.log('Debug info'); // ❌

// Don't log in production unnecessarily
this.logger.debug('Detailed state', hugeObject); // ❌ Will be filtered in prod anyway

// Don't log sensitive user data
this.logger.info('User password', password); // ❌
```

## Environment Variables

### Backend

```bash
# .env or deployment config
LOG_LEVEL=info      # none, error, warn, info, debug
NODE_ENV=production # Controls pino-pretty transport
```

### Frontend

Set in `apps/web-ui/src/environments/environment.ts`:

```typescript
logLevel: LogLevel.Debug; // Development
logLevel: LogLevel.Error; // Production
```

## Testing with Loggers

### Backend (NestJS)

```typescript
describe('ExampleService', () => {
  let service: ExampleService;
  let logger: PinoLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: PinoLogger,
          useValue: {
            setContext: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    logger = module.get<PinoLogger>(PinoLogger);
  });

  it('should log success message', async () => {
    await service.performAction('user123');

    expect(logger.info).toHaveBeenCalledWith('Action started for user: user123');
  });

  it('should log error on failure', async () => {
    jest.spyOn(service, 'doSomething').mockRejectedValue(new Error('Test error'));

    await expect(service.performAction('user123')).rejects.toThrow();

    expect(logger.error).toHaveBeenCalledWith('Action failed for user user123', expect.any(String));
  });
});
```

### Frontend (Angular)

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
});
```

## Migration Guide

If you find code using `console.log`:

### Backend

```typescript
// ❌ Before
console.log('User logged in:', email);
console.error('Error:', error);

// ✅ After
constructor(private readonly logger: PinoLogger) {
  this.logger.setContext(ClassName.name);
}

this.logger.info(`User logged in: ${email}`);
this.logger.error('Error occurred', error.stack);
```

### Frontend

```typescript
// ❌ Before
console.log('Component loaded');
console.error('Error:', error);

// ✅ After
constructor(private logger: LoggerService) {}

this.logger.info('Component loaded');
this.logger.error('Error occurred', error);
```

## Troubleshooting

### Logs not appearing in development

Check:

1. `LOG_LEVEL` environment variable (backend)
2. `environment.logLevel` setting (frontend)
3. Logger service is properly injected
4. `setContext()` is called in constructor (backend)

### Logs cluttering production

Backend:

- Set `LOG_LEVEL=error` in production environment
- Ensure `NODE_ENV=production` for JSON output

Frontend:

- Set `logLevel: LogLevel.Error` in `environment.prod.ts`

### Sensitive data in logs

- Review redaction config in `app.module.ts`
- Add fields to `redact` array
- Never log passwords, tokens, or PII
- Audit log statements before deployment

## References

- **Backend Logger**: [Pino Documentation](https://getpino.io/)
- **NestJS Integration**: [nestjs-pino](https://github.com/iamolegga/nestjs-pino)
- **Configuration**: `apps/web-server/src/app/app.module.ts:20-36`
- **Frontend Logger**: `apps/web-ui/src/app/core/services/logger.service.ts`
- **Example Usage**: `apps/web-server/src/app/auth/auth.service.ts`
