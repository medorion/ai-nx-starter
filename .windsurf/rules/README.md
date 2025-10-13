# Windsurf Rules

This directory contains project-specific coding rules for Windsurf AI assistant.

## How It Works

Windsurf automatically applies rules based on the `trigger` setting in each rule file's frontmatter:

- **`trigger: always_on`** - Rule is always applied (e.g., `general.md`)
- **`trigger: model_decision`** - Rule is applied when working in the specified context (e.g., `apps/web-ui`, `packages/types`)

## Available Rules

### Global Rules
- **`general.md`** - Always applied to all code
  - Package management (pnpm)
  - Code quality (ESLint, Prettier)
  - Monorepo structure
  - Cross-package dependencies

### Application Rules
- **`web-ui.md`** - Angular frontend (`apps/web-ui`)
  - Component architecture
  - Styling with LESS and ng-zorro
  - Form validation
  - State management
  - Error handling
  - **Uses core decorators and services**

- **`web-server.md`** - NestJS backend (`apps/web-server`)
  - Controller/Service architecture
  - Validation with class-validator
  - Exception handling
  - Data access patterns

### Package Rules
- **`api-client.md`** - HTTP client (`packages/api-client`)
  - API service structure
  - Configuration management
  - Observable patterns

- **`backend-common.md`** - Backend utilities (`packages/backend-common`)
  - Exception types
  - Shared utilities
  - Backend abstractions

- **`data-access-layer.md`** - Database access (`packages/data-access-layer`)
  - TypeORM entities
  - DbService pattern
  - Repository encapsulation
  - MongoDB patterns

- **`types.md`** - Shared types (`packages/types`)
  - DTO naming conventions
  - File organization
  - Validation decorators

## Sync with Claude Code

These Windsurf rules are kept in sync with Claude Code rules (`.claude/` directories).

### Comparison

| Tool | Rule Location | Trigger Mechanism |
|------|---------------|-------------------|
| **Windsurf** | `.windsurf/rules/*.md` | YAML frontmatter (`trigger`, `description`) |
| **Claude Code** | `.claude/instructions.md` (hierarchical) | Directory-based (automatic) |

**Key Differences:**
- **Windsurf**: Single directory with all rules, uses frontmatter for scoping
- **Claude Code**: Distributed rules in each app/package directory

## Maintaining Rules

When updating rules:
1. Update the relevant `.windsurf/rules/*.md` file
2. Update the corresponding `.claude/instructions.md` file
3. Keep the content aligned between both systems

## Rule Structure

Each Windsurf rule file should have:

```markdown
---
trigger: model_decision|always_on
description: Brief description of when this applies
---

# Title

Content with MUST/SHOULD/MAY requirements...
```

## Tips

- Use **MUST** for strict requirements
- Use **SHOULD** for strong recommendations
- Use **MAY** for optional patterns
- Provide code examples where helpful
- Reference implementation examples in the codebase
