# General Project Rules

These rules apply to all code in this monorepo.

## Documentation Resources

**IMPORTANT:** Before starting any task, consult the relevant documentation:

- **`CLAUDE.md`** - Quick reference guide (always read first)
- **`/prompts/`** - Step-by-step task templates for common workflows (CRUD, UI components, etc.)
  - Use when you need structured guidance for specific tasks
- **`/documents/`** - Technical architecture and standards documentation
  - `api-documentation-standards.md` - Swagger/OpenAPI patterns (auto-applied when creating endpoints)
  - `ai-testing-guidelines.md` - Testing approach and coverage decisions (auto-applied when writing tests)
  - `security-standards.md` - Validation, authentication, authorization patterns
  - `logging-guidelines.md` - Backend (PinoLogger) and frontend (LoggerService) logging
  - Architecture docs for each layer (web-server, web-ui, data-access-layer, etc.)

**Documentation will be automatically applied based on context** - you don't need to read every file manually.

## Package Management

- **MUST** use `pnpm` when installing packages
- Never use npm or yarn

## Code Quality

- **MUST** use the project's ESLint configuration for linting
- **MUST** use the project's Prettier configuration for formatting
- **CRITICAL**: ALL files created or modified MUST pass `npm run format:check` and `npm run lint`

### Prettier Configuration (from .prettierrc)

When creating or modifying ANY file, ALWAYS apply these formatting rules:

- **printWidth**: 140 characters max per line
- **singleQuote**: Use single quotes (') not double quotes (")
- **tabWidth**: 2 spaces for indentation
- **useTabs**: false (use spaces, not tabs)
- **trailingComma**: 'all' (add trailing commas everywhere possible)
- **bracketSpacing**: true (spaces inside object literals: `{ foo: bar }`)
- **endOfLine**: 'auto'

### ESLint Rules

Key rules from eslint.config.js:

- `prettier/prettier`: 'error' - Prettier violations fail the build
- `@typescript-eslint/no-explicit-any`: 'warning' - Avoid `any` type
- `@typescript-eslint/no-empty-function`: 'error' - Use `jest.fn()` instead of `() => {}`
- `prefer-const`: Use `const` for variables that are never reassigned

### File Creation Checklist

Before considering any file complete:

1. ✅ Apply Prettier formatting (140 char width, single quotes, trailing commas)
2. ✅ Ensure no ESLint violations (especially prefer-const, no-empty-function)
3. ✅ Use proper indentation (2 spaces, no tabs)
4. ✅ Add trailing commas to all multi-line objects/arrays/functions
5. ✅ Use single quotes for strings
6. ✅ Run `npm run format:fix` immediately after creating/modifying files

## Documentation Policy

- **DO NOT** generate document files (*.md) unless explicitly requested by the user
- Only create documentation when the user specifically asks for it
- NEVER create README files proactively

## Monorepo Structure

This is an Nx monorepo with the following structure:

- `/apps/web-ui` - Angular 19 frontend application
- `/apps/web-server` - NestJS 11 backend application
- `/packages/api-client` - Auto-generated HTTP client from controllers
- `/packages/backend-common` - Shared backend utilities and exceptions
- `/packages/data-access-layer` - TypeORM database access layer
- `/packages/types` - Shared types, DTOs, enums, and constants

## Cross-Package Dependencies

**CRITICAL RULES:**

- **NEVER** use relative paths to import from packages - use `@ai-nx-starter/*` imports
- **NEVER** import TypeORM directly in `web-server` - use `data-access-layer` services
- **NEVER** create manual HTTP services - use auto-generated `@ai-nx-starter/api-client`

**Dependency flow:**

- Frontend (`web-ui`) → `api-client` → HTTP requests to backend
- Backend (`web-server`) → `data-access-layer` → TypeORM → Database
- Both frontend and backend → `types` for shared DTOs, enums, constants
- Backend → `backend-common` for utilities, exceptions, guards

## API Documentation

**All endpoints MUST have Swagger decorators** - see `documents/api-documentation-standards.md` for detailed patterns.

**Critical rule:** NEVER add `@ApiProperty` decorators to DTOs in `packages/types` - Swagger decorators belong ONLY in controllers.

## Unit Testing

**All new functionality MUST include unit tests** - see `documents/ai-testing-guidelines.md` for detailed guidance.

**Testing commands:**

- `npm run test` - Run all tests
- `npm run test:coverage` - Run with coverage check (must meet 80% threshold)

**Before committing:**

1. ✅ Write unit tests for all new code
2. ✅ Run `npm run test:coverage` to verify tests pass and coverage meets 80%
3. ✅ Fix any failing tests before committing
