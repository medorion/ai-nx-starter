# Backend Logging - NestJS & Pino

Complete guide to structured logging in NestJS backend services using Pino.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Usage Pattern](#usage-pattern)
- [Log Levels](#log-levels)
- [Best Practices](#best-practices)
- [Sensitive Data Redaction](#sensitive-data-redaction)
- [Real-World Examples](#real-world-examples)
- [Testing with Loggers](#testing-with-loggers)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

---

## Overview

Backend logging uses **Pino** via `nestjs-pino` for structured JSON logs in production and pretty-printed logs in development.

**Key Benefits:**

- ✅ Structured JSON logs for parsing/aggregation
- ✅ Colorized development output via `pino-pretty`
- ✅ Automatic sensitive data redaction
- ✅ Context-aware logging per service
- ✅ High performance (Pino is one of the fastest loggers)

**Location:** `apps/web-server/src/app/app.module.ts:20-36`

---

## Configuration

### Module Setup

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

**Key Features:**

- **Development**: Colorized, single-line output via `pino-pretty`
- **Production**: Structured JSON logs for parsing/aggregation
- **Redaction**: Automatically hides sensitive headers (`Authorization`)
- **Level Control**: Set via `LOG_LEVEL` environment variable

### Environment Variables

```bash
# .env or deployment config
LOG_LEVEL=info      # none, error, warn, info, debug
NODE_ENV=production # Controls pino-pretty transport
```

---

## Usage Pattern

### Standard Service Pattern

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

**Key Pattern:**

- ✅ Inject `PinoLogger` in constructor
- ✅ Call `this.logger.setContext(ClassName.name)` in constructor
- ✅ Use appropriate log levels (`debug`, `info`, `warn`, `error`)
- ✅ Include context in log messages

---

## Log Levels

| Level   | When to Use                             | Example                                      |
| ------- | --------------------------------------- | -------------------------------------------- |
| `debug` | Development details, verbose data       | Request params, intermediate processing data |
| `info`  | User actions, successful operations     | Login success, record created, job completed |
| `warn`  | Recoverable issues, validation failures | Missing optional field, deprecated API usage |
| `error` | Failures, exceptions, critical errors   | Database errors, API failures, crashes       |

**Default Level:** `info` (shows `info`, `warn`, `error` but not `debug`)

---

## Best Practices

### ✅ DO

```typescript
// Include context in log messages
this.logger.info(`User logged in successfully: ${user.email}`);

// Log important state changes
this.logger.info(`Order status changed: ${orderId} from ${oldStatus} to ${newStatus}`);

// Include error context
this.logger.error(`Failed to process payment for order ${orderId}`, error.stack);

// Use debug for development details
this.logger.debug('Database query params', { query, params });

// Log structured data
this.logger.info('User action', { userId, action: 'login', timestamp: Date.now() });
```

### ❌ DON'T

```typescript
// Don't use console.log
console.log('User logged in'); // ❌

// Don't log without context
this.logger.info('Success'); // ❌ What succeeded?

// Don't forget to set context
constructor(private logger: PinoLogger) {} // ❌ Missing setContext

// Don't log sensitive data
this.logger.info(`Password: ${password}`); // ❌ Security risk

// Don't log in tight loops
for (const item of items) {
  this.logger.debug('Processing item', item); // ❌ Performance impact
}
```

---

## Sensitive Data Redaction

### Always Redact

- ❌ Passwords (plain or hashed)
- ❌ Full credit card numbers (PCI compliance)
- ❌ Social security numbers
- ❌ API keys and tokens (already redacted in headers)
- ❌ Personal health information

### Safe to Log

- ✅ User emails (for audit trails)
- ✅ User IDs
- ✅ Entity IDs
- ✅ Timestamps
- ✅ Operation names
- ✅ Last 4 digits of cards (if needed)

### Adding Redaction Rules

Edit `apps/web-server/src/app/app.module.ts`:

```typescript
redact: ['req.headers.authorization', 'password', 'creditCard', 'ssn', 'apiKey'];
```

---

## Real-World Examples

### Example 1: Authentication Service

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

### Example 2: DbService with Query Logging

```typescript
@Injectable()
export class UserDbService {
  constructor(
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserDbService.name);
  }

  async findById(id: string): Promise<User | null> {
    try {
      this.logger.debug(`Finding user by ID: ${id}`);
      const objectId = new ObjectId(id);
      const user = await this.userRepository.findOneBy({ _id: objectId } as any);

      if (!user) {
        this.logger.debug(`User not found: ${id}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error finding user ${id}`, error.stack);
      return null;
    }
  }

  async create(userData: CreateUserData): Promise<User> {
    this.logger.info(`Creating new user: ${userData.email}`);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);
    this.logger.info(`User created successfully: ${saved.id}`);

    return saved;
  }
}
```

---

## Testing with Loggers

### Mock Setup

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

---

## Migration Guide

### From console.log to PinoLogger

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

### Migration Checklist

1. ✅ Add `PinoLogger` to constructor
2. ✅ Call `setContext(ClassName.name)` in constructor
3. ✅ Replace `console.log` with `logger.info`
4. ✅ Replace `console.error` with `logger.error`
5. ✅ Replace `console.warn` with `logger.warn`
6. ✅ Replace `console.debug` with `logger.debug`
7. ✅ Add context to all log messages

---

## Troubleshooting

### Logs not appearing in development

**Check:**

1. `LOG_LEVEL` environment variable is set correctly
2. Logger service is properly injected
3. `setContext()` is called in constructor
4. `pino-pretty` is installed: `npm install pino-pretty --save-dev`

**Solution:**

```bash
LOG_LEVEL=debug npm run server
```

### Logs cluttering production

**Problem:** Too many logs in production environment

**Solution:**

```bash
# In production environment
LOG_LEVEL=error
NODE_ENV=production
```

### Sensitive data in logs

**Problem:** Passwords or tokens appearing in logs

**Solution:**

1. Review redaction config in `app.module.ts`
2. Add fields to `redact` array
3. Never log passwords, tokens, or PII
4. Audit log statements before deployment

**Example:**

```typescript
redact: ['req.headers.authorization', 'password', 'token', 'apiKey', 'creditCard'];
```

### Performance issues with logging

**Problem:** Logging impacting performance

**Solutions:**

1. Use `debug` level for verbose logs (filtered in production)
2. Avoid logging in tight loops
3. Use structured logging instead of concatenating strings
4. Set `LOG_LEVEL=error` in production

---

**Related Files:**

- [SKILL.md](../SKILL.md) - Main guide
- [services-guide.md](services-guide.md) - Service patterns
- [auth-session-guide.md](auth-session-guide.md) - Authentication logging patterns
- [security-guide.md](security-guide.md) - Never log sensitive data
- [testing-guide.md](testing-guide.md) - Testing guidelines (mock PinoLogger)
- [code-coverage-guide.md](code-coverage-guide.md) - Coverage exclusions

**References:**

- [Pino Documentation](https://getpino.io/)
- [nestjs-pino](https://github.com/iamolegga/nestjs-pino)
- Configuration: `apps/web-server/src/app/app.module.ts:20-36`
- Example: `apps/web-server/src/app/auth/auth.service.ts`
