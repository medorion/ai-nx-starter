# Development Task Templates

This directory contains ready-to-use **task templates** for common development workflows in AI-Nx-Starter.

## Purpose

These are **step-by-step instructions** that developers use when:

- Working with AI Coding agents (Claude Code, Windsurf, Cursor, etc.)
- Following standardized workflows for common tasks
- Ensuring consistency across the codebase

## Available Templates

### Complex Workflows

- **[create-crud-feature.md](./create-crud-feature.md)** - Create complete CRUD feature (DTOs → DB → API → UI)
- **[create-ui-component.md](./create-ui-component.md)** - Create Angular component with NG-ZORRO

**Note:** Most tasks don't need special prompts - just describe what you need in natural language:

- **API endpoints** - "Add a GET /products endpoint with pagination" → AI applies all standards automatically
- **Unit tests** - Tests created automatically via `documents/ai-testing-guidelines.md`
- **API docs** - Swagger added automatically via `documents/api-documentation-standards.md`
- **Debugging** - "I got these build errors: [paste]" → AI debugs systematically
- **Security** - Applied automatically via `documents/security-best-practices.md`

## How to Use

1. **Read the template** that matches your development task
2. **Replace `[PLACEHOLDERS]`** with your specific values (feature name, entity name, etc.)
3. **Follow step-by-step** instructions in sequence
4. **Consult `/documents/`** for deeper understanding of patterns and architecture

## Relationship to `/documents/`

| Directory     | Purpose                        | Content Type             | For           |
| ------------- | ------------------------------ | ------------------------ | ------------- |
| `/prompts/`   | WHAT to do (tasks)             | Step-by-step workflows   | Developers    |
| `/documents/` | WHY and HOW it works (context) | Guidelines, architecture | AI assistants |

**Example**:

- You use `create-crud-feature.md` for a complete feature (step-by-step workflow)
- It references `documents/ai-testing-guidelines.md` (AI context for automatic test generation)

Templates reference `/documents/` for AI context:

- `create-crud-feature.md` → `documents/logging-guidelines.md`, `documents/api-documentation-standards.md`, `documents/ai-testing-guidelines.md`
- `create-ui-component.md` → `documents/web-ui-technical.md`

## Contributing Templates

Found a useful workflow? Add a task template with:

- Clear task description and purpose
- Step-by-step instructions (numbered)
- Placeholders clearly marked with `[BRACKETS]`
- Expected outcomes and verification steps
- References to relevant `/documents/` for context
- Example usage (if helpful)
