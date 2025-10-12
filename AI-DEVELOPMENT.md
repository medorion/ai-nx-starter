# AI-First Development Guide

This guide explains how AI-Nx-Starter leverages AI coding assistants to accelerate full-stack development.

## Philosophy

AI-Nx-Starter is built around the principle that AI agents work best with:
- Clear architectural boundaries
- Consistent patterns and conventions
- Auto-generated boilerplate
- Well-documented workflows

## Quick Start with AI

### 1. Initial Setup

Tell your AI assistant:
```
Read the development workflow documentation in documents/dev-workflow.md
```

### 2. Building Features

Use this prompt template:
```
I need to create a new feature for [ENTITY_NAME].

1. Create the entity and DTOs in data-access-layer
2. Implement the API (controller, service, mapper) in web-server
3. Generate the API client
4. Build the UI based on existing examples

Follow the patterns in documents/dev-workflow.md
```

### 3. Testing Each Step

After each step, verify:
```
Run npm run build and check for errors
```

## AI Configuration Files

### .clinerules (for Claude Code)

Location: `/.clinerules`

Defines project-specific rules that help Claude understand:
- Package structure
- Naming conventions
- Import patterns
- Architecture constraints

### .cursorrules (for Cursor AI)

Location: `/.cursorrules`

Similar rules for Cursor AI editor integration.

## Common AI Workflows

### Creating a CRUD Feature

**Prompt:**
```
Create a CRUD feature for Product entity with the following fields:
- id (string)
- name (string)
- description (string)
- price (number)
- createdAt (Date)

Follow these steps:
1. Create ProductDto in packages/types
2. Create Product entity and ProductDbService in data-access-layer
3. Create ProductController, ProductService, and ProductMapper in web-server
4. Run npm run gen-api-client
5. Create Product UI components based on examples/list-item pattern
```

### Adding API Endpoints

**Prompt:**
```
Add a new endpoint to UserController:
- GET /users/search
- Query params: email, role, status
- Returns filtered list of users

Follow the pattern in example.controller.ts
After changes, run npm run gen-api-client
```

### Fixing Type Errors

**Prompt:**
```
Run npm run build and fix all TypeScript errors.
For each error, explain what's wrong and apply the fix.
```

### Generating Tests

**Prompt:**
```
Generate unit tests for [SERVICE_NAME] following Jest conventions.
Include tests for:
- Happy path scenarios
- Error handling
- Edge cases
```

## Auto-Generated Code

### API Client Generation

The `gen-api-client` script automatically generates Angular services from NestJS controllers:

```bash
npm run gen-api-client
```

**What it does:**
- Scans all `*.controller.ts` files
- Extracts HTTP methods, routes, parameters
- Generates type-safe Angular services
- Updates imports in `packages/api-client/src/index.ts`

**AI Prompt:**
```
After I create or modify any controller, remind me to run:
npm run gen-api-client
```

## Best Practices for AI Development

### 1. Always Provide Context

Good:
```
I need to add pagination to the Users list.
The backend already supports it (check UserController).
Update the UI component to use pagination similar to the examples/list-item pattern.
```

Bad:
```
Add pagination to users
```

### 2. Reference Existing Patterns

```
Create a new FormComponent following the same pattern as:
apps/web-ui/src/app/features/examples/forms
```

### 3. Specify Validation

```
When creating DTOs, use class-validator decorators:
- @IsString()
- @IsEmail()
- @IsOptional()
- @Min(), @Max()

See examples in packages/types/src/dto
```

### 4. Request Incremental Changes

Instead of:
```
Build the entire user management system
```

Use:
```
Step 1: Create the User entity with basic fields
(wait for completion and verification)

Step 2: Add the API endpoints
(wait and verify)

Step 3: Build the UI
```

## AI-Assisted Debugging

### Analyzing Errors

**Prompt:**
```
I got this error:
[paste error]

Analyze the error, identify the root cause, and suggest a fix.
```

### Performance Issues

**Prompt:**
```
The [COMPONENT_NAME] is rendering slowly.
Analyze the component and suggest optimizations:
- Memoization
- Change detection strategy
- Lazy loading
- Virtual scrolling if needed
```

## Project-Specific AI Rules

### Package Import Rules

Always use workspace aliases:
```typescript
// Correct
import { UserDto } from '@ai-nx-starter/types';
import { ApiUserService } from '@ai-nx-starter/api-client';

// Wrong
import { UserDto } from '../../../packages/types/src/dto/user.dto';
```

### Architecture Constraints

**Tell the AI:**
```
Never import TypeORM directly in web-server.
Always use data-access-layer services.
```

### Naming Conventions

Backend:
- Controllers: `[Feature]Controller`
- Services: `[Feature]Service`
- Mappers: `[Feature]Mapper`
- DbServices: `[Entity]DbService`

Frontend:
- Components: `[feature]-[type].component.ts`
- Services: `[feature].service.ts`
- Use kebab-case for file names

## Time-Saving AI Prompts

### Quick Component Generation

```
Generate an Angular component for displaying a list of [ENTITY].
Include:
- nz-table with pagination
- Search input
- Create/Edit/Delete buttons
- Use the pattern from examples/list-item
```

### API Integration

```
Connect the [Component] to the backend API.
Use the ApiService from @ai-nx-starter/api-client.
Add error handling and loading states.
```

### Documentation

```
Add JSDoc comments to all public methods in [FILE_NAME].
Include parameter descriptions and return types.
```

## Measuring AI Efficiency

Track these metrics to demonstrate AI value:

1. **Time to implement CRUD**: Target < 30 minutes with AI
2. **Code generation accuracy**: Target > 90% first-try success
3. **Build errors after generation**: Target < 3 errors per feature
4. **Test coverage**: AI can generate tests to 70%+ coverage

## Common Pitfalls

### 1. Not Running gen-api-client

**Problem:** Frontend imports outdated API types

**Solution:** Always run after backend changes
```bash
npm run gen-api-client
```

### 2. Inconsistent Patterns

**Problem:** AI generates code that doesn't match project style

**Solution:** Always reference existing examples:
```
Follow the exact pattern in [PATH_TO_EXAMPLE]
```

### 3. Missing Validation

**Problem:** DTOs without validation decorators

**Reminder:**
```
All DTOs must have class-validator decorators.
Check packages/types/src/dto for examples.
```

## Next Steps

1. Review the [prompts/](./prompts) directory for ready-to-use templates
2. Check [CASE-STUDY.md](./CASE-STUDY.md) for real-world examples
3. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines

## Support

For AI-specific questions or to share your efficiency gains:
- Open an issue with the `ai-workflow` label
- Share your prompts in discussions
