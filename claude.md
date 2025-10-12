# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Overview

AI-Nx-Starter: Nx monorepo with Angular 19 + NestJS 11. Auto-generates type-safe API clients from controllers.

**Stack:** `@ai-nx-starter/types` (DTOs), `@ai-nx-starter/api-client` (auto-gen), `@ai-nx-starter/backend-common`, `@ai-nx-starter/data-access-layer` (TypeORM)

## Commands

```bash
npm run start              # All services
npm run ui / server        # Individual services
npm run build              # After EVERY change
npm run gen-api-client     # After controller changes (generates Angular services)
npm run lint / format:fix  # Code quality
```

## Critical Rules

- Use `@ai-nx-starter/*` imports, NEVER relative paths to packages
- NEVER import TypeORM in `apps/web-server` - use `data-access-layer` services
- NEVER create manual HTTP services - use auto-generated `@ai-nx-starter/api-client`
- Run `npm run gen-api-client` after controller changes, `npm run build` after all changes

## CRUD Workflow

1. DTOs → `packages/types/src/dto/`
2. Entity → `packages/data-access-layer/src/features/[entity]/entities/`
3. DbService → `packages/data-access-layer/src/features/[entity]/services/`
4. Controller/Service/Mapper → `apps/web-server/src/app/features/[entity]/`
5. `npm run gen-api-client`
6. UI → `apps/web-ui/src/app/features/`
7. `npm run build` after each step

**Backend flow:** Controller → Service → Mapper → DbService → TypeORM

## Naming

Backend: `[Feature]Controller`, `[Feature]Service`, `[Feature]Mapper`, `[Entity]DbService`
Frontend: `[feature]-[type].component.ts` (kebab-case)

## Framework Rules

- NG-ZORRO components, OnPush change detection, reactive forms, LESS styling
- class-validator decorators in DTOs
- TypeORM only in data-access-layer, never in web-server

## Reference Examples

- Backend: `apps/web-server/src/app/features/user/`, `apps/web-server/src/app/features/example/`
- Frontend: `apps/web-ui/src/app/features/backoffice/users/`, `apps/web-ui/src/app/features/examples/`
- Data: `packages/data-access-layer/src/features/user/`
- Docs: `.clinerules`, `AI-DEVELOPMENT.md`, `prompts/`, `documents/dev-workflow.md`
