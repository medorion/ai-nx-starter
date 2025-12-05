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
- **ALWAYS run `npx prettier --write <file_path>` IMMEDIATELY after creating or modifying ANY file** - Format only changed files, not entire project
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
