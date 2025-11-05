# Web Server Application Rules

**Context**: NestJS backend application (`apps/web-server`)

## Framework

- Use **NestJS** framework for the web server

## Database Access

- **ALL** database access **MUST** go through the `data-access-layer` package
- **NEVER** use TypeORM directly in the web server
- **Remember** to register new DbServices and Entities in `data-access.module`

## Validation & DTOs

- **Always** use `class-validator` for request validation
- Use **DTOs** from `packages/types` for request and response objects
- Use dedicated mapping services for object mapping

## Exceptions

If the user needs to be notified, throw these exceptions from the `backend-common` package:

- `AppErrorException`
- `AppWarningException`
- `ConcurrencyException`
- `SessionExpiredException`
- `UnauthorizedLoginException`

## Architecture & Organization

- Each feature **MUST** have its own **module, controller, and service**
- **ALL** business logic **MUST** reside in services
- **ALL** data access **MUST** be delegated to the `data-access-layer`
- Each class/interface should be in a separate file
- Each `@Body` parameter **MUST** be a JSON object
  - If needed, create a DTO under `types/dto/features`

## Code Structure

- Follow NestJS best practices for dependency injection
- Use proper separation of concerns (Controller → Service → Data Access Layer)
- Keep controllers thin - they should only handle HTTP concerns
- Put all business logic in services
