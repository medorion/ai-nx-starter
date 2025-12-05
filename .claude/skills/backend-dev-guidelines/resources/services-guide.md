# Services - Business Logic Layer

Complete guide to organizing business logic with services and DbService.

## Table of Contents

- [Service Layer Overview](#service-layer-overview)
- [Service Structure](#service-structure)
- [Working with DbService](#working-with-dbservice)
- [Using Mappers](#using-mappers)
- [Service Design Principles](#service-design-principles)
- [Error Handling in Services](#error-handling-in-services)

---

## Service Layer Overview

### Purpose of Services

**Services contain business logic** - the 'what' and 'why' of your application:

```
Controller asks: "Create this user"
Service answers: "Check if email exists, validate rules, create user, return DTO"
DbService executes: "Here's the database operation"
```

**Services are responsible for:**

- ✅ Business rules enforcement
- ✅ Orchestrating DbService calls
- ✅ Transaction management
- ✅ Entity → DTO transformation (via Mapper)
- ✅ Throwing business exceptions
- ✅ Logging business operations

**Services should NOT:**

- ❌ Know about HTTP (Request/Response)
- ❌ Access TypeORM directly (use DbService)
- ❌ Handle route-specific logic
- ❌ Format HTTP responses

---

## Service Structure

### Standard Service Template

**File:** `apps/web-server/src/app/features/user/user.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CreateUserDto, UpdateUserDto, ClientUserDto } from '@ai-nx-starter/types';
import { UserDbService } from '@ai-nx-starter/data-access-layer';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserService {
  constructor(
    private readonly userDbService: UserDbService,
    private readonly userMapper: UserMapper,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserService.name);
  }

  async findAll(): Promise<ClientUserDto[]> {
    this.logger.debug('Finding all users');
    const users = await this.userDbService.findAll();
    return this.userMapper.toDtoArray(users);
  }

  async findOne(id: string): Promise<ClientUserDto> {
    this.logger.debug({ id }, 'Finding user by ID');
    const user = await this.userDbService.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.userMapper.toDto(user);
  }

  async create(createUserDto: CreateUserDto): Promise<ClientUserDto> {
    this.logger.info({ email: createUserDto.email }, 'Creating new user');

    // Business rule: Check if email already exists
    const existingUser = await this.userDbService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const user = await this.userDbService.create(createUserDto);
    return this.userMapper.toDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ClientUserDto> {
    this.logger.info({ id }, 'Updating user');

    // Business rule: Check if user exists
    const existingUser = await this.userDbService.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Business rule: If email is being updated, check for duplicates
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailTaken = await this.userDbService.findByEmail(updateUserDto.email);
      if (emailTaken) {
        throw new ConflictException(`Email ${updateUserDto.email} is already in use`);
      }
    }

    const user = await this.userDbService.update(id, updateUserDto);
    return this.userMapper.toDto(user);
  }

  async remove(id: string): Promise<void> {
    this.logger.info({ id }, 'Removing user');

    const existingUser = await this.userDbService.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userDbService.delete(id);
  }
}
```

**Key Patterns:**

- ✅ `@Injectable()` decorator for NestJS DI
- ✅ Constructor injection with `private readonly`
- ✅ Logger context set in constructor
- ✅ All methods return DTOs (via Mapper)
- ✅ Business exceptions thrown from service
- ✅ Logging at appropriate levels

---

## Working with DbService

### Service → DbService Flow

```
Service                          DbService
   │                                │
   ├─► findById(id)  ───────────►  │ TypeORM query
   │                                │
   ◄── User entity  ◄───────────── │
   │                                │
   ├─► Mapper.toDto(user)          │
   │                                │
   ◄── ClientUserDto               │
```

### DbService Usage in Services

```typescript
// ✅ CORRECT - Use DbService methods
const user = await this.userDbService.findById(id);
const users = await this.userDbService.findAll();
const created = await this.userDbService.create(dto);

// ❌ WRONG - Never use TypeORM directly in services
const user = await this.userRepository.findOne({ where: { id } });
```

### Orchestrating Multiple DbServices

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderDbService: OrderDbService,
    private readonly userDbService: UserDbService,
    private readonly productDbService: ProductDbService,
    private readonly orderMapper: OrderMapper,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OrderService.name);
  }

  async createOrder(dto: CreateOrderDto): Promise<ClientOrderDto> {
    // Validate user exists
    const user = await this.userDbService.findById(dto.userId);
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    // Validate all products exist and have stock
    for (const item of dto.items) {
      const product = await this.productDbService.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
    }

    // Create order
    const order = await this.orderDbService.create(dto);
    return this.orderMapper.toDto(order);
  }
}
```

---

## Using Mappers

### BaseMapper Pattern

All mappers extend `BaseMapper` which provides common mapping functionality:

**File:** `apps/web-server/src/common/base.mapper.ts`

```typescript
export abstract class BaseMapper<Entity, Dto> {
  constructor(
    private readonly entityClass: new () => Entity,
    private readonly dtoClass: new () => Dto,
  ) {}

  // Map entity to DTO
  toDto(entity: Entity): Dto {
    return plainToClass(this.dtoClass, entity, { excludeExtraneousValues: true });
  }

  // Map multiple entities to DTOs
  toDtoArray(entities: Entity[]): Dto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  // Map DTO to entity (for create operations)
  toEntity(dto: Partial<Dto>): Entity {
    return plainToClass(this.entityClass, dto);
  }

  // Abstract method for update operations (entity-specific)
  abstract toUpdateEntity(dto: Partial<Dto>): Partial<Entity>;
}
```

### Entity-Specific Mappers

Each entity has its own mapper extending BaseMapper:

**File:** `apps/web-server/src/app/features/user/user.mapper.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { User } from '@ai-nx-starter/data-access-layer';
import { ClientUserDto } from '@ai-nx-starter/types';
import { BaseMapper } from '../../../common/base.mapper';

@Injectable()
export class UserMapper extends BaseMapper<User, ClientUserDto> {
  constructor() {
    super(User, ClientUserDto);
  }

  toUpdateEntity(dto: Partial<ClientUserDto>): Partial<User> {
    return {
      name: dto.name,
      email: dto.email,
      role: dto.role,
      // Exclude fields that shouldn't be updated directly
    };
  }
}
```

### Mapper Usage in Services

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userDbService: UserDbService,
    private readonly userMapper: UserMapper,
  ) {}

  async findOne(id: string): Promise<ClientUserDto> {
    const user = await this.userDbService.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return this.userMapper.toDto(user);
  }

  async findAll(): Promise<ClientUserDto[]> {
    const users = await this.userDbService.findAll();
    return this.userMapper.toDtoArray(users);
  }
}
```

### Why Use Mappers?

**Benefits:**

- ✅ **Separation of concerns** - Mapping logic separated from business logic
- ✅ **Type safety** - Strong typing throughout the mapping process
- ✅ **Code reuse** - Common functionality in BaseMapper
- ✅ **Consistency** - Standardized approach across the application
- ✅ **Security** - Excludes sensitive fields (password, internal IDs)

**Best Practices:**

- Always use mappers for entity-to-DTO conversion
- Implement `toUpdateEntity()` for each entity's specific update logic
- Use `@Expose()` decorator in DTOs to control which fields are mapped
- Keep entity and DTO structures aligned but independent

---

## Service Design Principles

### 1. Single Responsibility

Each service should have ONE clear purpose:

```typescript
// ✅ GOOD - Single responsibility
@Injectable()
export class UserService {
  async create() {}
  async update() {}
  async delete() {}
}

@Injectable()
export class EmailService {
  async sendEmail() {}
  async sendBulkEmails() {}
}

// ❌ BAD - Too many responsibilities
@Injectable()
export class UserService {
  async createUser() {}
  async sendWelcomeEmail() {} // Should be EmailService
  async logUserActivity() {} // Should be AuditService
}
```

### 2. Clear Method Names

Method names should describe WHAT they do:

```typescript
// ✅ GOOD - Clear intent
async findByEmail(email: string)
async createWithDefaults(dto: CreateUserDto)
async deactivateAccount(id: string)

// ❌ BAD - Vague or misleading
async process()
async handle()
async doIt()
```

### 3. Explicit Return Types

Always use explicit return types:

```typescript
// ✅ GOOD - Explicit types
async create(dto: CreateUserDto): Promise<ClientUserDto> {}
async findAll(): Promise<ClientUserDto[]> {}
async remove(id: string): Promise<void> {}

// ❌ BAD - Implicit any
async create(dto) {}  // No types!
```

### 4. Avoid God Services

Don't create services that do everything:

```typescript
// ❌ BAD - God service with 50+ methods
@Injectable()
export class AppService {
  async createUser() {}
  async sendEmail() {}
  async processPayment() {}
  async generateReport() {}
  // ... 46 more methods
}

// ✅ GOOD - Focused services that orchestrate
@Injectable()
export class OrderService {
  constructor(
    private readonly orderDbService: OrderDbService,
    private readonly orderMapper: OrderMapper,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<ClientOrderDto> {
    const order = await this.orderDbService.create(dto);
    await this.paymentService.processPayment(order);
    await this.notificationService.sendOrderConfirmation(order);
    return this.orderMapper.toDto(order);
  }
}
```

---

## Error Handling in Services

### Throw Business Exceptions

Services throw NestJS exceptions - controllers don't need try/catch:

```typescript
@Injectable()
export class UserService {
  async findOne(id: string): Promise<ClientUserDto> {
    const user = await this.userDbService.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.userMapper.toDto(user);
  }

  async create(dto: CreateUserDto): Promise<ClientUserDto> {
    const existing = await this.userDbService.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException(`Email ${dto.email} already exists`);
    }

    const user = await this.userDbService.create(dto);
    return this.userMapper.toDto(user);
  }

  async updateStatus(id: string, status: string): Promise<ClientUserDto> {
    const user = await this.userDbService.findById(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (user.status === 'deleted') {
      throw new BadRequestException('Cannot update a deleted user');
    }

    const updated = await this.userDbService.update(id, { status });
    return this.userMapper.toDto(updated);
  }
}
```

### Exception Types

**NestJS Built-in Exceptions** (from `@nestjs/common`):

| Exception               | When to Use                      |
| ----------------------- | -------------------------------- |
| `NotFoundException`     | Resource doesn't exist           |
| `ConflictException`     | Duplicate resource (email, etc.) |
| `BadRequestException`   | Invalid business operation       |
| `ForbiddenException`    | User lacks permission            |
| `UnauthorizedException` | Not authenticated                |

**Custom Exceptions for User Notifications** (from `@ai-nx-starter/backend-common`):

Use these when the frontend needs to display a message to the user:

| Exception                    | When to Use                                      |
| ---------------------------- | ------------------------------------------------ |
| `AppErrorException`          | Display error message to user                    |
| `AppWarningException`        | Display warning message to user                  |
| `ConcurencyException`        | Concurrent update conflicts (optimistic locking) |
| `SessionExpiredException`    | User session has expired                         |
| `UnauthorizedLoginException` | Login credentials invalid                        |

```typescript
import { AppErrorException, AppWarningException } from '@ai-nx-starter/backend-common';

// Show error to user
throw new AppErrorException('Unable to process your request. Please try again.');

// Show warning to user
throw new AppWarningException('Your changes were saved, but email notification failed.');
```

### Parallel Operations

When orchestrating multiple DbService calls, use Promise.all for better performance:

```typescript
async getOrderDetails(orderId: string): Promise<OrderDetailsDto> {
  const order = await this.orderDbService.findById(orderId);
  if (!order) {
    throw new NotFoundException(`Order ${orderId} not found`);
  }

  // ✅ Parallel fetching - faster
  const [user, products, shipping] = await Promise.all([
    this.userDbService.findById(order.userId),
    this.productDbService.findByIds(order.productIds),
    this.shippingDbService.findByOrderId(orderId),
  ]);

  return this.orderMapper.toDetailsDto(order, user, products, shipping);
}

// Use Promise.allSettled when partial failures are acceptable
async notifyAllUsers(userIds: string[], message: string): Promise<void> {
  const results = await Promise.allSettled(
    userIds.map(id => this.notificationService.send(id, message))
  );

  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    this.logger.warn({ failureCount: failures.length }, 'Some notifications failed');
  }
}
```

### Logging Errors

```typescript
async create(dto: CreateUserDto): Promise<ClientUserDto> {
  try {
    const user = await this.userDbService.create(dto);
    this.logger.info({ userId: user.id }, 'User created successfully');
    return this.userMapper.toDto(user);
  } catch (error) {
    this.logger.error({ error, dto }, 'Failed to create user');
    throw error; // Re-throw for exception filter
  }
}
```

---

**Related Files:**

- [SKILL.md](../SKILL.md) - Main guide
- [types-guide.md](types-guide.md) - Types Package, DTOs, enums, constants, validation
- [controllers-guide.md](controllers-guide.md) - Controllers that use services
- [database-patterns-guide.md](database-patterns-guide.md) - DbService patterns
- [auth-session-guide.md](auth-session-guide.md) - Authentication and authorization
- [security-guide.md](security-guide.md) - Input validation, authorization, security patterns
- [logging-guide.md](logging-guide.md) - Logging patterns with Pino
- [testing-guide.md](testing-guide.md) - AI testing guidelines and proactive test generation
- [code-coverage-guide.md](code-coverage-guide.md) - Coverage exclusion guidelines
