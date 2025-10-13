# General Project Rules

These rules apply to all code in this monorepo.

## Package Management

- **MUST** use `pnpm` when installing packages
- Never use npm or yarn

## Code Quality

- **MUST** use the project's ESLint configuration for linting
- **MUST** use the project's Prettier configuration for formatting
- Follow the code style defined in `.eslintrc.json` and `.prettierrc`

## Documentation

- **DO NOT** generate document files unless explicitly requested by the user
- Only create documentation when the user specifically asks for it

## Monorepo Structure

This is an Nx monorepo with the following structure:
- `/apps/web-ui` - Angular frontend application
- `/apps/web-server` - NestJS backend application
- `/packages/api-client` - HTTP client for API communication
- `/packages/backend-common` - Shared backend utilities and exceptions
- `/packages/data-access-layer` - TypeORM database access layer
- `/packages/types` - Shared types, DTOs, enums, and constants

## Cross-Package Dependencies

- Frontend (`web-ui`) uses `api-client` for HTTP communication
- Backend (`web-server`) uses `data-access-layer` for database access
- Both frontend and backend use `types` package for shared types
- Backend uses `backend-common` for shared utilities and error handling
