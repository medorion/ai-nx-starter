# Development Task Templates

This directory contains ready-to-use **task templates** for common development workflows in AI-Nx-Starter.

## Purpose

These are **step-by-step instructions** that developers use when:

- Working with AI assistants (Claude, GPT-4, Cursor, etc.)
- Following standardized workflows for common tasks
- Ensuring consistency across the codebase

## Available Templates

### Feature Development

- **[create-crud-feature.md](./create-crud-feature.md)** - Create complete CRUD feature (DTOs → DB → API → UI)
- **[add-api-endpoint.md](./add-api-endpoint.md)** - Add new endpoint to existing controller
- **[create-ui-component.md](./create-ui-component.md)** - Create Angular component with NG-ZORRO

### Documentation & Testing

- **[document-api-endpoint.md](./document-api-endpoint.md)** - Add Swagger documentation to endpoints
- **[generate-tests.md](./generate-tests.md)** - Create unit tests for specific file

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

- You use `generate-tests.md` to create tests (step-by-step instructions)
- It references `documents/ai-testing-guidelines.md` (AI context on testing philosophy)

Task templates often reference documents for additional context:

- `generate-tests.md` → references `documents/code-coverage-exclusions.md`
- `add-api-endpoint.md` → references `documents/security-best-practices.md`
- `create-crud-feature.md` → references `documents/logging-guidelines.md`

## Contributing Templates

Found a useful workflow? Add a task template with:

- Clear task description and purpose
- Step-by-step instructions (numbered)
- Placeholders clearly marked with `[BRACKETS]`
- Expected outcomes and verification steps
- References to relevant `/documents/` for context
- Example usage (if helpful)
