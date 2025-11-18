# AI Context & Guidelines

This directory contains reference documentation and guidelines for AI coding assistants working in this repository.

## Purpose

These documents are **loaded as context** by AI assistants (like Claude Code) to understand:

- Architecture patterns and rules
- Framework-specific conventions
- Decision-making frameworks (testing, security, logging, etc.)
- Technical reference (API, auth, migrations, etc.)

## Naming Convention

All documents follow the pattern: `{topic}-{type}.md`

**Document Types:**

- **`-architecture.md`** - System design and structural patterns (how systems are built)
- **`-standards.md`** - Strict rules and conventions (must follow)
- **`-guidelines.md`** - Best practices and decision frameworks (should follow)

This convention ensures:

- Clear categorization by file suffix
- Alphabetical grouping of similar documents
- Consistent language across all documentation

## Directory Contents

### Architecture Reference

Technical documentation explaining how different parts of the system are structured:

- **auth-session-architecture.md** - Authentication and session management architecture
- **backend-common-architecture.md** - Shared utilities and common patterns
- **data-access-layer-architecture.md** - Database layer (TypeORM) architecture
- **web-server-architecture.md** - Backend (NestJS) architecture patterns and conventions
- **web-ui-architecture.md** - Frontend (Angular) architecture patterns and conventions

### Standards

Strict rules and conventions to follow:

- **api-documentation-standards.md** - Swagger/OpenAPI documentation patterns (auto-apply when creating endpoints)
- **security-standards.md** - Security rules for code generation

### Guidelines

Best practices and decision frameworks for AI decision-making:

- **ai-testing-guidelines.md** - How AI should approach testing in this codebase
- **code-coverage-guidelines.md** - Decision framework for what to test vs. exclude from coverage
- **database-migration-guidelines.md** - Database migration guidelines and patterns
- **logging-guidelines.md** - Logging standards, patterns, and best practices

**API Documentation:** See auto-generated Swagger UI at `http://localhost:3030/api/docs` (source of truth)

## How AI Uses These Documents

1. AI reads `CLAUDE.md` (always loaded as primary context)
2. AI references specific documents from this directory as needed for deeper understanding
3. Documents provide the **WHY** and **HOW** behind architectural decisions
4. Guidelines inform AI decision-making (e.g., when to test, how to log, security rules)

## For Developers

**Don't use these as task instructions.** These documents explain concepts and provide context, not step-by-step workflows.

Instead, see:

- **`/prompts/`** for step-by-step task templates
- **`CLAUDE.md`** for quick reference and critical rules

## Relationship to `/prompts/`

| Directory     | Purpose                    | Audience      | Content Type                    |
| ------------- | -------------------------- | ------------- | ------------------------------- |
| `/documents/` | AI context & architecture  | AI assistants | Guidelines, patterns, reference |
| `/prompts/`   | Task-specific instructions | Developers    | Step-by-step workflows          |

**Example**: A developer uses `/prompts/create-crud-feature.md` for a complete feature workflow, which internally references `/documents/ai-testing-guidelines.md` and `/documents/api-documentation-standards.md` for AI to automatically generate tests and API docs.
