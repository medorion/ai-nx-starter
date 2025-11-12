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
   - **REQUIRED:** Add Swagger decorators to ALL controller endpoints (📖 see `prompts/document-api-endpoint.md`)
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

- NG-ZORRO components, OnPush change detection, reactive forms, LESS styling
- class-validator decorators in DTOs (NEVER @ApiProperty in DTOs)
- Swagger decorators in controllers ONLY (@ApiOperation, @ApiResponse, @ApiParam, @ApiQuery, @ApiBody, @ApiBearerAuth)
- TypeORM only in data-access-layer, never in web-server

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

### AI Prompt Templates (`prompts/`)

**When to use:** Consult these BEFORE starting common tasks. They contain detailed step-by-step instructions.

- **`create-crud-feature.md`** - Creating complete CRUD features (DTOs → DB → API → UI)
- **`add-api-endpoint.md`** - Adding new endpoints to existing controllers
- **`document-api-endpoint.md`** - Adding Swagger documentation to endpoints
- **`create-ui-component.md`** - Creating Angular components with NG-ZORRO
- **`generate-tests.md`** - Writing comprehensive unit tests
- **`fix-build-errors.md`** - Troubleshooting build and lint errors
- **`security-best-practices.md`** - Security guidelines for implementation

**Usage:** Read the relevant prompt template at the START of the task to ensure you follow all requirements.

### Technical Reference (`documents/`)

**When to use:** Consult these when you need to understand architecture, patterns, or implementation details.

- **`api-reference.md`** - Complete API documentation with examples
- **`dev-workflow.md`** - Development workflow and best practices
- **`auth-session-model.md`** - Authentication and session management architecture
- **`web-server-techical.md`** - Backend architecture and patterns
- **`web-ui-technical.md`** - Frontend architecture and patterns
- **`data-access-layer-techical.md`** - Database layer architecture
- **`common-techical.md`** - Shared utilities and patterns
- **`migration-scripts.md`** - Database migration guidelines
- **`code-coverage-exclusions.md`** - Guidelines for what code to exclude from coverage (for humans & AI)
- **`ai-testing-guidelines.md`** - How AI assistants should approach testing in this codebase

**Usage:** Reference these when implementing features that touch these areas.

## Reference Examples

- Backend: `apps/web-server/src/app/features/user/`, `apps/web-server/src/app/features/example/`
- Frontend: `apps/web-ui/src/app/features/backoffice/users/`, `apps/web-ui/src/app/features/examples/`
- Data: `packages/data-access-layer/src/features/user/`
- Docs: `.clinerules`, `AI-DEVELOPMENT.md`
