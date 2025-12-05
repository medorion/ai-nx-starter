# DTOs - Data Transfer Objects

Complete guide to defining and validating DTOs with class-validator.

## Table of Contents

- [DTO Overview](#dto-overview)
- [Types Package Rules](#types-package-rules)
- [DTO Types and Naming](#dto-types-and-naming)
- [Validation Decorators](#validation-decorators)
- [DTO Patterns](#dto-patterns)
- [Advanced Validation](#advanced-validation)
- [Best Practices](#best-practices)

---

## DTO Overview

### Purpose

DTOs (Data Transfer Objects) define the shape of data moving between client and server:

```
Client → CreateUserDto → Controller → Service → Entity → Database
Database → Entity → Mapper → ClientUserDto → Controller → Client
```

**DTOs are responsible for:**

- ✅ Defining data structure and types
- ✅ Input validation rules (via class-validator)
- ✅ API contract documentation
- ✅ Type safety across the stack
- ✅ Shared between client and server (framework-agnostic)

**DTOs should NOT:**

- ❌ Contain business logic (belongs in services)
- ❌ Access the database
- ❌ Include server or client-specific code/references
- ❌ Include Swagger decorators (@ApiProperty belongs in controllers)
- ❌ Have methods beyond getters/setters

---

## Types Package Rules

### Package Context

**Location:** `packages/types`

This package is **shared between server and client**.

**Critical Rules:**

- ✅ **MUST NOT** include server or client-specific references/code
- ✅ Keep it framework-agnostic and pure TypeScript
- ✅ Use only standard TypeScript and class-validator decorators

### File Organization

**Folder Structure:**

- **Constants** → `constants/` folder
- **Enums** → `enums/` folder
- **DTOs** → `dto/` folder

**DTO Organization:**

```
packages/types/src/dto/
├── common/                        # Shared DTOs
│   ├── id-name.dto.ts
│   └── query-result.dto.ts
├── features/                      # Feature-specific DTOs
│   ├── users/                     # Multiple DTOs for same entity
│   │   ├── client-user.dto.ts
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── teams/
│   │   ├── team.dto.ts
│   │   ├── create-team.dto.ts
│   │   ├── update-team.dto.ts
│   │   └── add-member.dto.ts
│   └── auth/
│       └── login-user.dto.ts
└── examples/                      # Example DTOs
    └── todo-item/
        ├── todo-item.dto.ts
        ├── create-todo-item.dto.ts
        └── update-todo-item.dto.ts
```

**Key Rules:**

- ✅ Multiple DTOs for the same entity → create subfolder
- ✅ Example: `dto/features/users/` contains all user-related DTOs
- ✅ Group by feature domain, not by DTO type

### Naming Conventions

**File Naming:**

- ✅ **ALL** DTO files **MUST** end with `.dto.ts`
- ✅ Use `kebab-case` for file names

**Class Naming:**

- ✅ **ALL** DTO classes **MUST** end with `Dto`
- ✅ Use `PascalCase` for class names

**Examples:**

| File Name                  | Class Name            | ✅/❌ |
| -------------------------- | --------------------- | ----- |
| `user-registration.dto.ts` | `UserRegistrationDto` | ✅    |
| `create-user.dto.ts`       | `CreateUserDto`       | ✅    |
| `team.dto.ts`              | `TeamDto`             | ✅    |
| `user.ts`                  | `UserDto`             | ❌    |
| `CreateUser.dto.ts`        | `CreateUserDto`       | ❌    |
| `user-dto.ts`              | `UserDto`             | ❌    |

### Validation Requirements

**MUST use class-validator decorators:**

- ✅ Annotate ALL fields with validation decorators
- ✅ Use decorators for validation AND clarity
- ✅ Makes the DTO self-documenting

```typescript
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UserRegistrationDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;
}
```

---

## DTO Types and Naming

### Standard DTO Types

| Type                  | Purpose                     | Example            |
| --------------------- | --------------------------- | ------------------ |
| `Create[Entity]Dto`   | Creating new resources      | `CreateUserDto`    |
| `Update[Entity]Dto`   | Updating existing resources | `UpdateUserDto`    |
| `Client[Entity]Dto`   | Returning data to client    | `ClientUserDto`    |
| `[Entity]Dto`         | Generic representation      | `TeamDto`          |
| `[Action][Entity]Dto` | Specific actions            | `LoginUserDto`     |
|                       |                             | `AddTeamMemberDto` |

---

## Validation Decorators

### Common Decorators

Import from `class-validator`:

```typescript
import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
```

| Decorator           | Purpose                 | Example                                         |
| ------------------- | ----------------------- | ----------------------------------------------- |
| `@IsString()`       | Must be a string        | `@IsString() name: string`                      |
| `@IsNumber()`       | Must be a number        | `@IsNumber() age: number`                       |
| `@IsEmail()`        | Must be valid email     | `@IsEmail() email: string`                      |
| `@IsBoolean()`      | Must be boolean         | `@IsBoolean() active: boolean`                  |
| `@IsDate()`         | Must be Date object     | `@IsDate() createdAt: Date`                     |
| `@IsDateString()`   | Must be ISO date string | `@IsDateString() date: string`                  |
| `@IsEnum()`         | Must be enum value      | `@IsEnum(Role) role: Role`                      |
| `@IsArray()`        | Must be array           | `@IsArray() tags: string[]`                     |
| `@IsNotEmpty()`     | Required field          | `@IsNotEmpty() name: string`                    |
| `@IsOptional()`     | Optional field          | `@IsOptional() phone?: string`                  |
| `@MinLength(n)`     | Minimum string length   | `@MinLength(6) password: string`                |
| `@MaxLength(n)`     | Maximum string length   | `@MaxLength(100) title: string`                 |
| `@Min(n)`           | Minimum number value    | `@Min(0) price: number`                         |
| `@Max(n)`           | Maximum number value    | `@Max(100) percentage: number`                  |
| `@ValidateNested()` | Validate nested objects | See [Advanced Validation](#advanced-validation) |

### Decorator Order

**Best Practice:** Place decorators in this order:

1. Type validators (`@IsString()`, `@IsNumber()`, etc.)
2. Optional/Required (`@IsOptional()`, `@IsNotEmpty()`)
3. Constraints (`@MinLength()`, `@Min()`, etc.)

```typescript
// ✅ GOOD - Logical order
@IsString()
@IsNotEmpty()
@MinLength(3)
public name: string;

@IsEmail()
@IsOptional()
public email?: string;

// ❌ BAD - Random order
@MinLength(3)
@IsString()
@IsNotEmpty()
public name: string;
```

---

## DTO Patterns

### Create DTO Pattern

**File:** `packages/types/src/dto/features/users/create-user.dto.ts`

```typescript
import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../../enums/core/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsEnum(Role)
  @IsNotEmpty()
  public role: Role;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  public password: string;

  @IsString()
  @IsOptional()
  public phone?: string;

  @IsString()
  @IsOptional()
  public picture?: string;
}
```

**Key Patterns:**

- ✅ All required fields use `@IsNotEmpty()`
- ✅ Optional fields use `@IsOptional()` and `?` type modifier
- ✅ Password has minimum length validation
- ✅ Enum validation for role
- ✅ No `id`, `createdAt`, `updatedAt` (server-generated)
- ✅ Use `public` access modifier

### Update DTO Pattern

**File:** `packages/types/src/dto/features/users/update-user.dto.ts`

```typescript
import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Role } from '../../../enums/core/role.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  public firstName?: string;

  @IsString()
  @IsOptional()
  public lastName?: string;

  @IsEnum(Role)
  @IsOptional()
  public role?: Role;

  @IsEmail()
  @IsOptional()
  public email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  public password?: string;

  @IsString()
  @IsOptional()
  public phone?: string;

  @IsString()
  @IsOptional()
  public picture?: string;
}
```

**Key Patterns:**

- ✅ All fields are optional (`@IsOptional()` and `?`)
- ✅ Validation still applies when field is provided
- ✅ Same constraints as Create DTO (e.g., `@MinLength(6)` for password)
- ✅ No `id`, `createdAt`, `updatedAt` fields

### Client/Response DTO Pattern

**File:** `packages/types/src/dto/features/users/client-user.dto.ts`

```typescript
import { IsString, IsEmail, IsOptional, IsNotEmpty, IsEnum, IsDate } from 'class-validator';
import { Role } from '../../../enums/core/role.enum';

export class ClientUserDto {
  @IsString()
  public id: string;

  @IsOptional()
  @IsString()
  public firstName: string;

  @IsOptional()
  @IsString()
  public lastName: string;

  @IsEnum(Role)
  @IsNotEmpty()
  public role: Role;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsOptional()
  public phone?: string;

  @IsString()
  @IsOptional()
  public picture?: string;

  @IsDate()
  @IsOptional()
  public createdAt?: Date;

  @IsDate()
  @IsOptional()
  public updatedAt?: Date;
}
```

**Key Patterns:**

- ✅ Includes `id` field (server-generated)
- ✅ Includes `createdAt` and `updatedAt` timestamps
- ✅ Excludes sensitive fields (password, internal IDs)
- ✅ Used for API responses

---

## Advanced Validation

### Array Validation

```typescript
import { IsArray, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  // Array of strings
  @IsArray()
  @IsString({ each: true })
  public memberIds: string[];

  // Optional array
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public tags?: string[];
}
```

**Key Points:**

- ✅ Use `@IsArray()` to validate array type
- ✅ Use `{ each: true }` to validate each element
- ✅ Combine with `@IsOptional()` for optional arrays

### Nested Object Validation

```typescript
import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  public street: string;

  @IsString()
  @IsNotEmpty()
  public city: string;

  @IsString()
  @IsNotEmpty()
  public zipCode: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  // Single nested object
  @ValidateNested()
  @Type(() => AddressDto)
  public address: AddressDto;

  // Array of nested objects
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  public previousAddresses: AddressDto[];
}
```

**Key Points:**

- ✅ Use `@ValidateNested()` for nested validation
- ✅ Use `@Type(() => ClassName)` to specify class type
- ✅ Import `Type` from `class-transformer`
- ✅ Use `{ each: true }` for arrays of nested objects

### Enum Validation

```typescript
import { IsEnum, IsOptional } from 'class-validator';

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export class UpdateUserDto {
  @IsEnum(UserStatus)
  @IsOptional()
  public status?: UserStatus;
}
```

**Key Points:**

- ✅ Define enum in shared `enums/` folder or same file
- ✅ Use `@IsEnum(EnumName)` decorator
- ✅ TypeScript ensures type safety

### Date Validation

```typescript
import { IsDate, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateEventDto {
  // For Date objects
  @IsDate()
  @IsNotEmpty()
  public startDate: Date;

  // For ISO date strings from JSON
  @IsDateString()
  @IsOptional()
  public endDate?: string;
}
```

**Key Points:**

- ✅ Use `@IsDate()` for Date objects
- ✅ Use `@IsDateString()` for ISO 8601 date strings
- ✅ JSON typically sends dates as strings

### Custom Validation Messages

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  public email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  public password: string;
}
```

**Key Points:**

- ✅ Add custom messages via `{ message: '...' }` option
- ✅ Helpful for user-facing error messages
- ✅ Optional - default messages are often sufficient

---

## Best Practices

### 1. Always Use Public Access Modifier

```typescript
// ✅ GOOD - Explicit public
export class CreateUserDto {
  @IsString()
  public name: string;
}

// ❌ BAD - No access modifier
export class CreateUserDto {
  @IsString()
  name: string;
}
```

### 2. Optional Fields Pattern

```typescript
// ✅ GOOD - Both decorator and type modifier
@IsString()
@IsOptional()
public phone?: string;

// ❌ BAD - Missing @IsOptional()
@IsString()
public phone?: string;

// ❌ BAD - Missing ? type modifier
@IsString()
@IsOptional()
public phone: string;
```

### 3. Required vs Optional in Create vs Update

```typescript
// CreateUserDto - Required fields
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public name: string; // Required for creation
}

// UpdateUserDto - All optional
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  public name?: string; // Optional for updates
}
```

### 4. Exclude Server-Generated Fields from Input DTOs

```typescript
// ✅ GOOD - Create DTO without server fields
export class CreateUserDto {
  @IsString()
  public name: string;
  // No id, createdAt, updatedAt
}

// ❌ BAD - Including server-generated fields
export class CreateUserDto {
  @IsString()
  public id: string; // Server generates this!

  @IsString()
  public name: string;

  @IsDate()
  public createdAt: Date; // Server generates this!
}
```

### 5. Include Server Fields in Response DTOs

```typescript
// ✅ GOOD - Client DTO with all fields
export class ClientUserDto {
  @IsString()
  public id: string;

  @IsString()
  public name: string;

  @IsDate()
  @IsOptional()
  public createdAt?: Date;

  @IsDate()
  @IsOptional()
  public updatedAt?: Date;
}
```

### 6. Never Include Sensitive Fields in Response DTOs

```typescript
// ✅ GOOD - Password excluded from client DTO
export class ClientUserDto {
  @IsString()
  public id: string;

  @IsString()
  public email: string;
  // No password field!
}

// ❌ BAD - Password exposed to client
export class ClientUserDto {
  @IsString()
  public id: string;

  @IsString()
  public password: string; // NEVER expose passwords!
}
```

### 7. Use Descriptive DTO Names

```typescript
// ✅ GOOD - Clear purpose
export class CreateUserDto {}
export class UpdateUserDto {}
export class ClientUserDto {}
export class LoginUserDto {}
export class AddTeamMemberDto {}

// ❌ BAD - Vague names
export class UserInputDto {}
export class UserDataDto {}
export class UserDto {} // Ambiguous purpose
```

### 8. Group Related DTOs in Feature Folders

```
// ✅ GOOD - Organized by feature
packages/types/src/dto/features/
├── users/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── client-user.dto.ts
└── teams/
    ├── create-team.dto.ts
    ├── update-team.dto.ts
    └── team.dto.ts

// ❌ BAD - All in one folder
packages/types/src/dto/
├── create-user.dto.ts
├── update-user.dto.ts
├── client-user.dto.ts
├── create-team.dto.ts
├── update-team.dto.ts
└── team.dto.ts
```

### 9. Export DTOs from Index Files

**File:** `packages/types/src/dto/features/users/index.ts`

```typescript
export * from './create-user.dto';
export * from './update-user.dto';
export * from './client-user.dto';
```

**File:** `packages/types/src/index.ts`

```typescript
// Export all DTOs
export * from './dto/features/users';
export * from './dto/features/teams';
export * from './dto/features/auth';
```

### 10. Validation Happens Automatically

```typescript
// ✅ GOOD - Controller delegates validation to ValidationPipe
@Post()
async create(@Body() createUserDto: CreateUserDto): Promise<ClientUserDto> {
  return this.userService.create(createUserDto);
}

// ❌ BAD - Manual validation (unnecessary)
@Post()
async create(@Body() createUserDto: CreateUserDto): Promise<ClientUserDto> {
  if (!createUserDto.email) {
    throw new BadRequestException('Email is required');
  }
  return this.userService.create(createUserDto);
}
```

### 11. Keep DTOs Framework-Agnostic

```typescript
// ✅ GOOD - Pure TypeScript + class-validator
import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}

// ❌ BAD - NestJS-specific decorators
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty() // Don't use in DTOs!
  public email: string;
}

// ❌ BAD - Angular-specific code
import { FormControl } from '@angular/forms';

export class CreateUserDto {
  public emailControl: FormControl; // Client-specific!
}
```

---

## Common Patterns

### Pattern 1: Entity with Members

```typescript
// Team with member IDs
export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsArray()
  @IsString({ each: true })
  public memberIds: string[];
}

export class TeamDto {
  @IsString()
  public id: string;

  @IsString()
  public name: string;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsArray()
  @IsString({ each: true })
  public memberIds: string[];

  @IsDate()
  @IsOptional()
  public createdAt?: Date;

  @IsDate()
  @IsOptional()
  public updatedAt?: Date;
}
```

### Pattern 2: Partial Update DTO

```typescript
// Add/Remove specific members
export class AddTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;
}

export class RemoveTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;
}
```

### Pattern 3: Query/Filter DTOs

```typescript
import { IsOptional, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';

export class UserQueryDto {
  @IsOptional()
  @IsEnum(Role)
  public role?: Role;

  @IsOptional()
  @IsString()
  public search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  public page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  public limit?: number;
}
```

---

**Related Files:**

- [SKILL.md](../SKILL.md) - Main guide
- [controllers-guide.md](controllers-guide.md) - How controllers use DTOs
- [services-guide.md](services-guide.md) - How services transform DTOs
- [database-patterns-guide.md](database-patterns-guide.md) - Entity vs DTO differences
- [security-guide.md](security-guide.md) - Input validation and security
- [testing-guide.md](testing-guide.md) - Testing DTOs
- [code-coverage-guide.md](code-coverage-guide.md) - Coverage for DTOs
