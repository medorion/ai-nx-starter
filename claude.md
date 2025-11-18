# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Overview

AI-Nx-Starter: Nx monorepo with Angular 19 + NestJS 11. Auto-generates type-safe API clients from controllers.

**Stack:** `@ai-nx-starter/types` (DTOs), `@ai-nx-starter/api-client` (auto-gen), `@ai-nx-starter/backend-common`, `@ai-nx-starter/data-access-layer` (TypeORM)

## Commands

```bash
npm run start          # All services
npm run ui / server    # Individual services
npm run build          # After EVERY change
npm run gen-api-client # After controller changes (generates Angular services)
npm run lint           # Check code quality (must pass)
npm run format:check   # Verify formatting (must pass)
npm run format:fix     # Auto-fix formatting issues
```

## Critical Rules

- Use `@ai-nx-starter/*` imports, NEVER relative paths to packages
- NEVER import TypeORM in `apps/web-server` - use `data-access-layer` services
- NEVER create manual HTTP services - use auto-generated `@ai-nx-starter/api-client`
- Run `npm run gen-api-client` after controller changes, `npm run build` after all changes
- **ALWAYS run `npm run format:fix` IMMEDIATELY after creating or modifying ANY file** - Prettier formatting is enforced
- **ALL files MUST pass `npm run format:check` and `npm run lint`** before considering work complete

## Formatting Rules (Prettier)

Apply these to EVERY file created or modified:

- 140 char max line width
- Single quotes ('), not double (")
- 2 spaces indentation (no tabs)
- Trailing commas everywhere
- Spaces in object literals: `{ foo: bar }`

## Lint Rules (ESLint)

Avoid these common violations:

- Use `const` for variables never reassigned (not `let`)
- Use `jest.fn()` instead of empty arrow functions `() => {}`
- Avoid `any` type when possible
- Prettier formatting is enforced as error

## CRUD Workflow

**📖 See `prompts/create-crud-feature.md` for complete step-by-step guide**

1. DTOs → `packages/types/src/dto/` (class-validator ONLY, NO @ApiProperty)
2. Entity → `packages/data-access-layer/src/features/[entity]/entities/`
3. DbService → `packages/data-access-layer/src/features/[entity]/services/`
4. Controller/Service/Mapper → `apps/web-server/src/app/features/[entity]/`
   - **REQUIRED:** Add Swagger decorators to ALL controller endpoints (📖 auto-apply using `documents/api-documentation-standards.md`)
   - **REQUIRED:** Write unit tests for controller, service, and mapper (📖 see `prompts/generate-tests.md`)
   - Follow pattern in `apps/web-server/src/app/features/user/`
5. `npm run test` - Verify all tests pass
6. `npm run gen-api-client`
7. UI → `apps/web-ui/src/app/features/` (📖 see `prompts/create-ui-component.md`)
8. `npm run build` after each step (📖 see `prompts/fix-build-errors.md` if issues)
9. Verify Swagger UI at `http://localhost:3030/api/docs`

**Backend flow:** Controller → Service → Mapper → DbService → TypeORM

## Naming

Backend: `[Feature]Controller`, `[Feature]Service`, `[Feature]Mapper`, `[Entity]DbService`
Frontend: `[feature]-[type].component.ts` (kebab-case)

## Framework Rules

**📖 Read `documents/security-best-practices.md` before creating DTOs or endpoints**
**📖 Read `documents/api-documentation-standards.md` when creating/modifying controllers**

- NG-ZORRO components, OnPush change detection, reactive forms, LESS styling
- class-validator decorators in DTOs (NEVER @ApiProperty in DTOs)
- **ALWAYS add Swagger decorators when creating/modifying endpoints** - this is automatic, not optional
- Swagger decorators in controllers ONLY (@ApiOperation, @ApiResponse, @ApiParam, @ApiQuery, @ApiBody, @ApiBearerAuth)
- TypeORM only in data-access-layer, never in web-server

## Logging Standards

- **Backend**: Use `PinoLogger` from `nestjs-pino` - ALWAYS call `this.logger.setContext(ClassName.name)` in constructor
- **Frontend**: Use `LoggerService` from `@app/core/services`
- ❌ NEVER use `console.log/warn/error` directly
- ✅ Use appropriate levels: `debug` (dev), `info` (actions), `warn` (issues), `error` (failures)
- 📖 See `documents/logging-guidelines.md` for detailed patterns and examples

## Testing & Coverage

**Coverage Thresholds:** 80% statements/lines, 60% branches/functions

**IMPORTANT:** Before creating tests or suggesting coverage exclusions:

1. ✅ **READ** `documents/code-coverage-exclusions.md` - Decision framework for what to test vs. exclude
2. ✅ **READ** `documents/ai-testing-guidelines.md` - How AI should approach testing in this codebase
3. ✅ **CHECK** existing `jest.config.ts` files for current exclusions
4. ✅ **FOLLOW** the decision tree: Business logic = MUST TEST, Infrastructure = Consider excluding

**Key Principles:**

- ❌ NEVER exclude business logic, auth/security code, or data transformation
- ✅ Write tests for services, controllers, guards, mappers, business components
- ✅ Consider excluding: pure presentation components, SSE/WebSocket infrastructure, framework wrappers
- ✅ Explain your reasoning when suggesting exclusions
- ✅ Listen to user feedback and re-evaluate decisions

## Documentation Resources

### Task Templates (`prompts/`)

**What:** Step-by-step instructions for specific development tasks
**When to use:** BEFORE starting common tasks (CRUD, endpoints, UI, tests)
**For:** Developers working with AI assistants

- **`create-crud-feature.md`** - Complete CRUD features (DTOs → DB → API → UI)
- **`create-ui-component.md`** - Create Angular components with NG-ZORRO
- **`generate-tests.md`** - Write comprehensive unit tests
- **`fix-build-errors.md`** - Troubleshoot build and lint errors

**Note:** No separate prompt needed for adding endpoints - just describe what you need and AI applies all standards automatically.

### AI Context & Guidelines (`documents/`)

**What:** Reference documentation and rules for AI assistants
**When to use:** For understanding architecture, patterns, and decision frameworks
**For:** AI assistants (auto-loaded as context)

- **`api-documentation-standards.md`** - Swagger/OpenAPI documentation patterns (auto-apply when creating endpoints)
- **`api-reference.md`** - Complete API documentation with examples
- **`auth-session-model.md`** - Authentication and session management architecture
- **`logging-guidelines.md`** - Logging standards, patterns, and best practices
- **`security-best-practices.md`** - Security guidelines for implementation
- **`web-server-techical.md`** - Backend architecture and patterns
- **`web-ui-technical.md`** - Frontend architecture and patterns
- **`data-access-layer-techical.md`** - Database layer architecture
- **`common-techical.md`** - Shared utilities and patterns
- **`migration-scripts.md`** - Database migration guidelines
- **`code-coverage-exclusions.md`** - Guidelines for what code to exclude from coverage (for humans & AI)
- **`ai-testing-guidelines.md`** - How AI assistants should approach testing in this codebase

## Reference Examples

- Backend: `apps/web-server/src/app/features/user/`, `apps/web-server/src/app/features/example/`
- Frontend: `apps/web-ui/src/app/features/backoffice/users/`, `apps/web-ui/src/app/features/examples/`
- Data: `packages/data-access-layer/src/features/user/`
- Docs: `CLAUDE.md`, `/documents/`, `/prompts/`
