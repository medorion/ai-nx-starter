# Development Task Templates

This directory contains ready-to-use **task templates** for common development workflows in AI-Nx-Starter.

## Purpose

These are **step-by-step instructions** that developers use when:

- Working with AI Coding agents (Claude Code, Windsurf, Cursor, etc.)
- Following standardized workflows for common tasks
- Ensuring consistency across the codebase

## Available Templates

### Feature Development

- **[create-crud-feature.md](./create-crud-feature.md)** - Create complete CRUD feature (DTOs → DB → API → UI)
- **[create-ui-component.md](./create-ui-component.md)** - Create Angular component with NG-ZORRO

**Note:** For adding individual API endpoints, simply describe what you need to the AI. Swagger documentation, validation, and testing are applied automatically via AI context (see `documents/api-documentation-standards.md`, `documents/security-best-practices.md`).

**Note:** Unit tests and API documentation are created automatically as part of development. See `documents/ai-testing-guidelines.md` and `documents/api-documentation-standards.md` for AI context.

### Debugging

- **[fix-build-errors.md](./fix-build-errors.md)** - Troubleshoot TypeScript/build errors

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

Task templates often reference documents for additional context:

- `create-crud-feature.md` → references `documents/logging-guidelines.md`, `documents/api-documentation-standards.md`, `documents/ai-testing-guidelines.md`
- `create-ui-component.md` → references `documents/web-ui-technical.md`
- `fix-build-errors.md` → references debugging patterns and build tools

## Contributing Templates

Found a useful workflow? Add a task template with:

- Clear task description and purpose
- Step-by-step instructions (numbered)
- Placeholders clearly marked with `[BRACKETS]`
- Expected outcomes and verification steps
- References to relevant `/documents/` for context
- Example usage (if helpful)
