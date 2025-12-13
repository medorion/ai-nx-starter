# Types Package & DTOs Guide

Complete guide for the shared types package (`@ai-nx-starter/types`) - DTOs, enums, constants, and validation.

## Table of Contents

- [Types Package Overview](#types-package-overview)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [DTOs - Data Transfer Objects](#dtos---data-transfer-objects)
- [Validation Decorators](#validation-decorators)
- [DTO Patterns](#dto-patterns)
- [Advanced Validation](#advanced-validation)
- [Enums](#enums)
- [Constants](#constants)
- [Best Practices](#best-practices)

---

## Types Package Overview

### Purpose

**Location:** `packages/types` (`@ai-nx-starter/types`)

This package is **shared between server and client** (Angular frontend + NestJS backend).

**Critical Rules:**

- ✅ **MUST NOT** include server or client-specific references/code
- ✅ Keep it framework-agnostic and pure TypeScript
- ✅ Use only standard TypeScript and class-validator decorators
- ✅ No NestJS decorators (e.g., `@ApiProperty`)
- ✅ No Angular-specific code (e.g., `FormControl`)
- ✅ No Node.js-specific imports (e.g., `fs`, `path`)

**Why it matters:**

- Ensures code can run in both browser and Node.js environments
- Maintains clean separation of concerns
- Enables type safety across the entire stack

---

## File Organization

### Top-Level Structure

```
packages/types/src/
├── constants/          # Shared constants
├── enums/             # Shared enumerations
└── dto/               # Data Transfer Objects
```

**Key Rules:**

- ✅ **Constants** → `constants/` folder
- ✅ **Enums** → `enums/` folder
- ✅ **DTOs** → `dto/` folder

### DTO Organization

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

**Organization Rules:**

- ✅ Multiple DTOs for the same entity → create subfolder
- ✅ Example: `dto/features/users/` contains all user-related DTOs
- ✅ Group by feature domain, not by DTO type

### Enum Organization

```
packages/types/src/enums/
├── core/                          # Core enums
│   ├── role.enum.ts
│   └── status.enum.ts
└── features/                      # Feature-specific enums
    ├── user/
    │   └── user-status.enum.ts
    └── team/
        └── team-role.enum.ts
```

### Constants Organization

```
packages/types/src/constants/
├── common/                        # Common constants
│   ├── defaults.ts
│   └── limits.ts
└── features/                      # Feature-specific constants
    └── auth/
        └── session-config.ts
```

---

## Naming Conventions

### DTO Naming

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

### Enum Naming

**File Naming:**

- ✅ Use `kebab-case` ending with `.enum.ts`

**Enum Naming:**

- ✅ Use `PascalCase` without `Enum` suffix

**Examples:**

```typescript
// ✅ GOOD
// File: role.enum.ts
export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

// ❌ BAD
// File: RoleEnum.ts
export enum RoleEnum {
  Admin = 'admin',
}
```

### Constants Naming

**File Naming:**

- ✅ Use `kebab-case` ending with `.ts`

**Constant Naming:**

- ✅ Use `UPPER_SNAKE_CASE` for primitive constants
- ✅ Use `PascalCase` for object constants

**Examples:**

```typescript
// ✅ GOOD
export const DEFAULT_PAGE_SIZE = 20;
export const ApiDefaults = {
  timeout: 30000,
  retries: 3,
} as const;

// ❌ BAD
export const defaultPageSize = 20; // Use UPPER_SNAKE_CASE
export const API_DEFAULTS = { timeout: 30000 }; // Use PascalCase for objects
```

---

## DTOs - Data Transfer Objects

### DTO Purpose

DTOs define the shape of data moving between client and server:

```
Client → CreateUserDto → Controller → Service → Entity → Database
Database → Entity → Mapper → ClientUserDto → Controller → Client
```

**DTOs are responsible for:**

- ✅ Defining data structure and types
- ✅ Input validation rules (via class-validator)
- ✅ API contract documentation
- ✅ Type safety across the stack

**DTOs should NOT:**

- ❌ Contain business logic (belongs in services)
- ❌ Access the database
- ❌ Include server or client-specific code/references
- ❌ Include Swagger decorators (`@ApiProperty` belongs in controllers)
- ❌ Have methods beyond getters/setters

### Validation Requirements

**MUST use class-validator decorators:**

- ✅ Annotate ALL fields with validation decorators
- ✅ Use decorators for validation AND clarity
- ✅ Makes the DTO self-documenting
- ✅ Use `public` access modifier for all fields

```typescript
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UserRegistrationDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

  @IsString()
  @IsOptional()
  public firstName?: string;
}
```

### DTO Types and Naming

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

### 9. Export from Index Files

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

// Export all enums
export * from './enums/core/role.enum';
export * from './enums/core/status.enum';

// Export all constants
export * from './constants/common/limits';
export * from './constants/common/defaults';
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

## Enums

### Purpose

Enums define a set of named constants that represent a fixed set of values.

**Use enums when:**

- ✅ You have a fixed set of related values (roles, statuses, types)
- ✅ The values are known at compile time
- ✅ The values are used across client and server

### String Enums (Preferred)

```typescript
// ✅ GOOD - String enums are JSON-serializable
export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}
```

**Why string enums:**

- ✅ More readable in logs and debugging
- ✅ Safer for database storage
- ✅ Easier to serialize/deserialize
- ✅ Better for API contracts

### Numeric Enums (Avoid)

```typescript
// ❌ AVOID - Numeric enums can cause serialization issues
export enum Role {
  Admin, // 0
  User, // 1
  Guest, // 2
}
```

**Problems with numeric enums:**

- ❌ Less readable in logs
- ❌ Can cause issues with JSON serialization
- ❌ Database values are not self-documenting

### Usage with DTOs

```typescript
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../enums/core/role.enum';
import { UserStatus } from '../../enums/features/user/user-status.enum';

export class CreateUserDto {
  @IsEnum(Role)
  public role: Role;

  @IsEnum(UserStatus)
  @IsOptional()
  public status?: UserStatus;
}
```

---

## Constants

### Purpose

Constants define reusable values that don't change at runtime.

**Use constants when:**

- ✅ You have magic numbers or strings that need names
- ✅ You want to centralize configuration values
- ✅ You need shared defaults across client and server

### Primitive Constants

```typescript
// File: constants/common/limits.ts
export const MAX_USERNAME_LENGTH = 50;
export const MIN_PASSWORD_LENGTH = 6;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_FILE_SIZE_MB = 5;
```

### Object Constants

```typescript
// File: constants/common/defaults.ts
export const PaginationDefaults = {
  page: 1,
  pageSize: 20,
  maxPageSize: 100,
} as const;

export const ValidationMessages = {
  email: 'Please provide a valid email address',
  password: 'Password must be at least 6 characters',
} as const;
```

**Key points:**

- ✅ Use `as const` to make object constants deeply readonly
- ✅ Group related constants in objects
- ✅ Export object constants with `PascalCase` names

### Usage with DTOs

```typescript
import { IsString, MinLength, MaxLength } from 'class-validator';
import { MIN_PASSWORD_LENGTH, MAX_USERNAME_LENGTH } from '../../constants/common/limits';

export class CreateUserDto {
  @IsString()
  @MaxLength(MAX_USERNAME_LENGTH)
  public username: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  public password: string;
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

**CRITICAL:** Query parameters from URLs are always strings. Use `@Type()` to transform them to numbers.

```typescript
import { IsOptional, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UserQueryDto {
  @IsOptional()
  @IsEnum(Role)
  public role?: Role;

  @IsOptional()
  @IsString()
  public search?: string;

  @IsOptional()
  @Type(() => Number) // ✅ REQUIRED: Transforms string to number
  @IsNumber()
  @Min(1)
  public page?: number;

  @IsOptional()
  @Type(() => Number) // ✅ REQUIRED: Transforms string to number
  @IsNumber()
  @Min(1)
  @Max(100)
  public limit?: number;
}
```

**Why `@Type()` is required:**

- ✅ HTTP query parameters are always strings (e.g., `?page=1` → `"1"`)
- ✅ `@Type(() => Number)` transforms `"1"` → `1` before validation
- ✅ Without it, validation fails: "must be a number conforming to the specified constraints"
- ✅ Import from `class-transformer`, not `class-validator`

**Common transformation patterns:**

```typescript
import { Type } from 'class-transformer';

// String to Number
@Type(() => Number)
@IsNumber()
public age?: number;

// String to Boolean
@Type(() => Boolean)
@IsBoolean()
public active?: boolean;

// String to Date
@Type(() => Date)
@IsDate()
public startDate?: Date;

// For ISO date strings, use @IsDateString() instead (no @Type needed)
@IsDateString()
public endDate?: string;
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
