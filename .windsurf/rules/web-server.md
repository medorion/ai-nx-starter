---
trigger: model_decision
description: Applies only to apps/web-server
---

---

trigger: model_decision
description: Applies only to apps/web-server

---

# Web Server Package Rules

## Framework

- Use **NestJS** framework for the web server.

## Database Access

- All database access must go through the **data-access-layer** package.
- **Never** use TypeORM directly in the web server.
- Remember to register new DbServices and Entities in our data-access.module

## Validation & DTOs

- Always use **class-validator** for request validation.
- Use **DTOs** from `packages/types` for request and response objects.
- Use dedicated mapping services for object mapping.

## Exceptions

- If user needs to be notified throw AppErrorException,AppWarningException,ConcurencyException,SessionExpiredException, UnauthorizedLoginException from our backend-common package

## Architecture & Organization

- Each feature **must** have its own **module, controller, and service**.
- All business logic **must** reside in services.
- All data access **must** be delegated to the data-access-layer.
- Each class/interface should be in separate file
