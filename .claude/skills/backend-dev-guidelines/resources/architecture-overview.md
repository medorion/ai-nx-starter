# Architecture Overview - Backend Services

Complete guide to the layered architecture pattern used in backend microservices.

## Table of Contents

- [Layered Architecture Pattern](#layered-architecture-pattern)
- [Request Lifecycle](#request-lifecycle)
- [Separation of Concerns](#separation-of-concerns)

---

## Layered Architecture Pattern

### The Four Layers

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 1: CONTROLLERS               │
│  - Request/response handling        │
│  - Input validation (via pipes)     │
│  - Delegate to services             │
│  - Return DTOs                      │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 2: SERVICES                  │
│  - Business logic                   │
│  - Orchestration                    │
│  - Entity ↔ DTO mapping (Mapper)    │
│  - No HTTP knowledge                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 3: DbService                 │
│  - Data access abstraction          │
│  - Query optimization               │
│  - Caching                          │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│            TypeORM                  │
└─────────────────────────────────────┘
```

## Request Lifecycle

### Complete Flow Example

```typescript
1. HTTP POST /users
     ↓
  2. NestJS routes to UserController based on @Controller('users') and @Post() decorators
     ↓
  3. NestJS middleware/guards execute (in order):
     - Global exception filter (all-exceptions.filter.ts)
     - AuthorizeGuard (from @ai-nx-starter/backend-common)
       * Verifies JWT token
       * Checks @Authorize() decorator permissions
       * Injects SessionInfo
     - ValidationPipe (validates DTO with class-validator)
     ↓
  4. Controller method executes:
     @Post()
     @ApiOperation({ summary: 'Create user' })
     @ApiResponse({ status: 201, type: ClientUserDto })
     async create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<ClientUserDto> {
       return this.userService.create(createUserDto);
     }
     - Input already validated by ValidationPipe
     - Swagger decorators provide API documentation
     - Delegates to UserService
     ↓
  5. Service executes business logic:
     async create(createUserDto: CreateUserDto): Promise<ClientUserDto> {
       this.logger.info({ dto: createUserDto }, 'Creating user');

       // Business logic/validation
       const existingUser = await this.userDbService.findByEmail(createUserDto.email);
       if (existingUser) throw new ConflictException('Email already exists');

       // Create via DbService
       const user = await this.userDbService.create(createUserDto);

       // Map Entity → DTO
       return this.userMapper.toDto(user); 
     }
     ↓
  6. Mapper transforms data:
     toDto(user: User): ClientUserDto {
       return plainToClass(ClientUserDto, {
         id: user.id,
         name: user.name,
         email: user.email,
         role: user.role,
         // Excludes sensitive fields like password
       });
     }
     ↓
  7. DbService (in @ai-nx-starter/data-access-layer) performs database operation:
     async create(createUserDto: CreateUserDto): Promise<User> {
       const user = this.userRepository.create({
         name: createUserDto.name,
         email: createUserDto.email,
         passwordHash: await hash(createUserDto.password),
         role: createUserDto.role || Role.User,
       });

       return await this.userRepository.save(user);
     }
     ↓
  8. TypeORM Repository executes queries:
     - Returns User entity
     ↓
  9. Response flows back:
     TypeORM → DbService → Service → Mapper → Controller → NestJS → Client

     Final response: ClientUserDto (201 Created)
     {
       "id": "123",
       "name": "John Doe",
       "email": "john@example.com",
       "role": "user"
     }
     ↓
  10. API Client Auto-Generation:
      - tools/api-client-generator reads UserController
      - Generates ApiUserService in @ai-nx-starter/api-client
      - Angular frontend uses type-safe service:
        this.apiUserService.create(createUserDto).subscribe(...)
```

---

## Separation of Concerns

### What Goes Where

**Controllers Layer:**

- ✅ Request parsing (params, body, query)
- ✅ Delegate to services
- ✅ Return DTOs
- ✅ Swagger documentation
- ❌ Business logic
- ❌ Database operations
- ❌ Error handling (use exception filters)

**Services Layer:**

- ✅ Business logic
- ✅ Business rules enforcement
- ✅ Orchestration (multiple DbServices)
- ✅ Transaction management
- ✅ Entity → DTO transformation (via Mapper)
- ❌ HTTP concerns (Request/Response)
- ❌ Direct TypeORM calls (use DbService)

**Database Layer:**

- ✅ Query construction
- ✅ Database error handling
- ✅ Caching
- ❌ Business logic
- ❌ HTTP concerns

### Example: User Creation

**Controller:**

```typescript
  @ApiOperation({ summary: 'Create user', description: 'Create a new user. Email must be unique. Password will be hashed automatically.' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully created', type: ClientUserDto })
  @ApiResponse({ status: 400, description: 'Validation failed or email already exists' })
  @Authorize(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<ClientUserDto> {
    return await this.userService.create(createUserDto);
  }
```

**Service:**

```typescript
  async create(createUserDto: CreateUserDto): Promise<ClientUserDto> {
    // Check if user with email already exists
    const existingUser = await this.userDbService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const entity = await this.userDbService.create(createUserDto);
    return this.userMapper.toDto(entity);
  }
```

**DbService:**

```typescript
  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await hash(dto.password),
      role: dto.role || Role.User,
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
```

### DTO (class-validator)

```typescript
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;
}
```

**Location:** `packages/types/src/dto/`

### Module

```typescript
import { Module } from '@nestjs/common';

@Module({
  controllers: [UserController],
  providers: [UserService, UserMapper],
  exports: [UserService],
})
export class UserModule {}
```

**Location:** `app/app.module.ts`

**Notice:** Each layer has clear, distinct responsibilities!

---

**Related Files:**

- [SKILL.md](../SKILL.md) - Main guide
- [controllers-guide.md](controllers-guide.md) - Controller patterns
- [services-guide.md](services-guide.md) - Service patterns
- [database-patterns-guide.md](database-patterns-guide.md) - DbService patterns
- [auth-session-guide.md](auth-session-guide.md) - Authentication and authorization
- [security-guide.md](security-guide.md) - Security best practices
- [logging-guide.md](logging-guide.md) - Logging patterns
- [testing-guide.md](testing-guide.md) - AI testing guidelines
- [code-coverage-guide.md](code-coverage-guide.md) - Coverage exclusion guidelines
