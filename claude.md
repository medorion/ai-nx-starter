# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Overview

AI-Nx-Starter: Nx monorepo with Angular 19 + NestJS 11. Auto-generates type-safe API clients from controllers.

**Stack:** `@ai-nx-starter/types` (DTOs), `@ai-nx-starter/api-client` (auto-gen), `@ai-nx-starter/backend-common`, `@ai-nx-starter/data-access-layer` (TypeORM)

---

## 🚀 Quick Start

**New to this project?** Start here:

### Backend Development

1. Read `.claude/skills/backend-dev-guidelines/SKILL.md`
2. Review `prompts/backend-prompt-guide.md` for writing effective prompts
3. Follow the Development Workflow below

### Frontend Development

1. Read `.claude/skills/frontend-dev-guidelines/SKILL.md`
2. Review `prompts/frontend-prompt-guide.md` for writing effective prompts
3. Follow the Development Workflow below

---

## 📚 Skills System

This project uses **Claude Code Skills** to enforce best practices and provide implementation guidance.

### Available Skills

- **backend-dev-guidelines** - NestJS, TypeORM, dependency injection, layered architecture
- **frontend-dev-guidelines** - Angular 19, NG-ZORRO, RxJS, OnPush, lazy loading

### How Skills Work

Skills automatically activate based on:

- **Keywords** in your prompts (e.g., "component", "controller", "API", "form")
- **File paths** you're working with (e.g., `apps/web-ui/src/**/*.ts`)
- **Code patterns** detected (e.g., `@Component`, `@Controller`)

**You don't need to manually invoke skills** - they activate automatically when relevant.

---

## ✍️ Writing Effective Prompts

**Key Principle:** Skills define HOW. Prompts define WHAT.

### Backend Prompts

Focus on:

- Entity fields and relationships
- Business rules and validation
- API endpoints and authorization
- Special workflows or integrations

**Example:**

```
Create a CRUD feature for Task entity.

## Entity Fields
- title: string (required, 3-100 chars)
- status: enum (Todo, InProgress, Done)
- assignedTo: User (optional, many-to-one)

## Business Rules
- Only task owner or Admin can update/delete
- Status transitions: Todo → InProgress → Done (one-way)
```

📖 See `prompts/backend-prompt-guide.md` for detailed examples.

### Frontend Prompts

Focus on:

- UI requirements and layout
- User interactions and navigation
- Data to display and when to fetch it
- Validation rules and authorization

**Example:**

```
Create a task list page with filtering and CRUD actions.

## UI Requirements
- Display tasks in a table: title, status, assignee, created date
- Filter dropdown for status (All, Todo, InProgress, Done)
- Action buttons: View, Edit, Delete (authorized users only)

## User Interactions
- Click row to view task details
- Edit button navigates to /tasks/:id/edit
- Delete shows confirmation dialog

## Data Requirements
- Fetch tasks on page load using ApiTaskService.getTasks()
- Refresh list after create/update/delete
```

📖 See `prompts/frontend-prompt-guide.md` for detailed examples.

---

## 🔥 Critical Rules

**Package Imports:**

- ✅ Use `@ai-nx-starter/*` imports for all package imports
- ❌ NEVER use relative paths to packages (e.g., `../../../packages/types`)

**API Client:**

- ✅ Use auto-generated services from `@ai-nx-starter/api-client`
- ❌ NEVER manually edit files in `packages/api-client/` (auto-generated)
- ❌ NEVER create manual HTTP services

**Data Access:**

- ✅ Use `data-access-layer` services for database operations
- ❌ NEVER import TypeORM directly in `apps/web-server`

**Code Quality:**

- ✅ Run `npm run gen-api-client` after controller changes
- ✅ Run `npm run build` after EVERY change
- ✅ Run `npx prettier --write <file_path>` IMMEDIATELY after creating/modifying ANY file
- ✅ ALL files MUST pass `npm run format:check` and `npm run lint` before work is complete

---

## 🛠️ Development Workflow

1. **Write your prompt** (follow guides in `prompts/`)
2. **Let skills activate automatically** (backend-dev-guidelines or frontend-dev-guidelines)
3. **Implement the feature** following skill checklists and patterns
4. **Format code**: `npx prettier --write <changed_files>`
5. **Build**: `npm run build` (or `npm run gen-api-client` if controllers changed)
6. **Verify quality**: `npm run lint && npm run format:check`
7. **Test**: `npm run test` (optional: `npm run test:coverage`)
8. **Commit changes** with descriptive message

---

## 📋 Commands

### Development

```bash
npm run start  # Start all services (frontend + backend)
npm run ui     # Start frontend only (Angular dev server)
npm run server # Start backend only (NestJS)
```

### Build & Generation

```bash
npm run build          # Build all packages (run after EVERY change)
npm run gen-api-client # Generate API client from NestJS controllers
```

### Code Quality

```bash
npm run lint           # Check code quality (must pass)
npm run format:check   # Verify Prettier formatting (must pass)
npm run format:fix     # Auto-fix formatting issues
npx prettier --write <file_path>  # Format specific file(s)
```

### Testing

```bash
npm run test          # Run all tests
npm run test:coverage # Run tests with coverage report
```

---

## 📐 Formatting Rules (Prettier)

Apply these to EVERY file created or modified:

- 140 char max line width
- Single quotes (`'`), not double (`"`)
- 2 spaces indentation (no tabs)
- Trailing commas everywhere
- Spaces in object literals: `{ foo: bar }`

**Auto-format:** `npx prettier --write <file_path>`

---

## 🔍 Lint Rules (ESLint)

Avoid these common violations:

- Use `const` for variables never reassigned (not `let`)
- Use `jest.fn()` instead of empty arrow functions `() => {}`
- Avoid `any` type when possible
- Prettier formatting is enforced as error

**Check:** `npm run lint`

---

## 🗂️ Monorepo Structure

This is an Nx monorepo with the following structure:

- `/apps/web-ui` - Angular 19 frontend application
- `/apps/web-server` - NestJS 11 backend application
- `/packages/api-client` - Auto-generated HTTP client from controllers (**DO NOT EDIT**)
- `/packages/backend-common` - Shared backend utilities and exceptions
- `/packages/data-access-layer` - TypeORM database access layer
- `/packages/types` - Shared types, DTOs, enums, and constants

---

## 🔗 Cross-Package Dependencies

**Dependency flow:**

- Frontend (`web-ui`) → `api-client` → HTTP requests to backend
- Backend (`web-server`) → `data-access-layer` → TypeORM → Database
- Both frontend and backend → `types` for shared DTOs, enums, constants
- Backend → `backend-common` for utilities, exceptions, guards

**Import rules:**

- ✅ `import { UserDto } from '@ai-nx-starter/types'`
- ❌ `import { UserDto } from '../../../packages/types/src/...'`

---

## ❓ Need Help?

- **Backend patterns**: `.claude/skills/backend-dev-guidelines/SKILL.md`
- **Frontend patterns**: `.claude/skills/frontend-dev-guidelines/SKILL.md`
- **Writing prompts**: `prompts/backend-prompt-guide.md` or `prompts/frontend-prompt-guide.md`
- **Skill activation**: `.claude/skills/skill-rules.json`
- **Project overview**: `README.md`
