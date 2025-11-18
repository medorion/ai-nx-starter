# AI Context & Guidelines

This directory contains reference documentation and guidelines for AI coding assistants working in this repository.

## Purpose

These documents are **loaded as context** by AI assistants (like Claude Code) to understand:

- Architecture patterns and rules
- Framework-specific conventions
- Decision-making frameworks (testing, security, logging, etc.)
- Technical reference (API, auth, migrations, etc.)

## Directory Contents

### Architecture Reference

Technical documentation explaining how different parts of the system are structured:

- **web-server-techical.md** - Backend (NestJS) architecture patterns and conventions
- **web-ui-technical.md** - Frontend (Angular) architecture patterns and conventions
- **data-access-layer-techical.md** - Database layer (TypeORM) architecture
- **common-techical.md** - Shared utilities and common patterns

### Guidelines & Standards

Rules and frameworks for AI decision-making:

- **logging-guidelines.md** - Logging standards, patterns, and best practices
- **security-best-practices.md** - Security rules for code generation
- **ai-testing-guidelines.md** - How AI should approach testing in this codebase
- **code-coverage-exclusions.md** - Decision framework for what to test vs. exclude from coverage

### Technical Reference

Detailed reference documentation:

- **api-reference.md** - Complete API documentation with examples
- **auth-session-model.md** - Authentication and session management architecture
- **migration-scripts.md** - Database migration guidelines and patterns

## How AI Uses These Documents

1. AI reads `CLAUDE.md` or `.clinerules` (always loaded as primary context)
2. AI references specific documents from this directory as needed for deeper understanding
3. Documents provide the **WHY** and **HOW** behind architectural decisions
4. Guidelines inform AI decision-making (e.g., when to test, how to log, security rules)

## For Developers

**Don't use these as task instructions.** These documents explain concepts and provide context, not step-by-step workflows.

Instead, see:

- **`/prompts/`** for step-by-step task templates
- **`CLAUDE.md`** for quick reference and critical rules
- **`.clinerules`** for comprehensive development standards

## Relationship to `/prompts/`

| Directory     | Purpose                    | Audience      | Content Type                    |
| ------------- | -------------------------- | ------------- | ------------------------------- |
| `/documents/` | AI context & architecture  | AI assistants | Guidelines, patterns, reference |
| `/prompts/`   | Task-specific instructions | Developers    | Step-by-step workflows          |

**Example**: A developer uses `/prompts/generate-tests.md` to create tests, which internally references `/documents/ai-testing-guidelines.md` for AI to understand testing philosophy.
