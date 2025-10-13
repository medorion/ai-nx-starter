# Types Package Rules

**Context**: Shared types package (`packages/types`)

## Purpose

This package is shared between server and client.

- **MUST NOT** include server or client specific reference/code
- Keep it framework-agnostic and pure TypeScript

## File Organization

- **Constants** must be placed in the `constants` folder
- **Enums** must be placed in the `enum` folder
- **DTOs** must be placed in the `dto` folder
- Multiple DTOs for the same entity must be placed in a corresponding subfolder
  - Example: `types/dto/todo-item.dto.ts`

## Naming Conventions

- **ALL** DTO files **MUST** end with `.dto.ts`
- **ALL** DTO classes **MUST** end with `Dto`

**Example:**
- File: `user-registration.dto.ts`
- Class: `UserRegistrationDto`

## Validation

- Use `class-validator` to annotate and describe fields in DTOs for validation and clarity
- Add decorators like `@IsString()`, `@IsEmail()`, `@IsOptional()`, etc.

**Example:**

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
