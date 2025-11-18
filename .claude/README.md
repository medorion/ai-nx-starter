# Claude Code Instructions

This directory contains project-specific instructions for Claude Code, an AI coding assistant.

## How It Works

Claude Code automatically reads instruction files from `.claude/instructions.md` in the current directory and all parent directories up to the project root. This allows for:

1. **Global rules** - Applied to the entire project
2. **Scope-specific rules** - Applied only when working in specific apps or packages

## Directory Structure

```
.claude/
├── instructions.md          # Global project rules (always applied)
└── README.md               # This file

apps/
├── web-ui/
│   └── .claude/
│       └── instructions.md  # Angular frontend rules
└── web-server/
    └── .claude/
        └── instructions.md  # NestJS backend rules

packages/
├── api-client/
│   └── .claude/
│       └── instructions.md  # API client rules
├── backend-common/
│   └── .claude/
│       └── instructions.md  # Backend utilities rules
├── data-access-layer/
│   └── .claude/
│       └── instructions.md  # Database layer rules
└── types/
    └── .claude/
        └── instructions.md  # Shared types rules
```

## Rule Precedence

When working in a specific directory, Claude Code reads instructions from:

1. **Root** `.claude/instructions.md` (general project rules)
2. **Directory-specific** `.claude/instructions.md` (if it exists)

Both sets of rules are applied, with more specific rules taking precedence.

## Examples

### Working on the frontend (apps/web-ui)

Claude Code will apply:

- General project rules (pnpm, ESLint, Prettier, etc.)
- Web UI specific rules (Angular conventions, ng-zorro, styling, etc.)

### Working on the backend (apps/web-server)

Claude Code will apply:

- General project rules
- Web Server specific rules (NestJS, validation, exceptions, etc.)

### Working on data access (packages/data-access-layer)

Claude Code will apply:

- General project rules
- Data Access Layer specific rules (TypeORM, entities, DbServices, etc.)

## Maintaining Instructions

### Adding New Rules

1. For global rules: Edit `.claude/instructions.md` at the project root
2. For app/package-specific rules: Edit the corresponding `.claude/instructions.md` in that directory

### Creating Rules for New Apps/Packages

When adding a new app or package, create `.claude/instructions.md` in its directory:

```bash
mkdir -p apps/new-app/.claude
touch apps/new-app/.claude/instructions.md
```

## Configuration History

This hierarchical configuration structure was designed specifically for Claude Code to provide context-aware AI assistance across the monorepo. Each directory contains relevant rules and patterns for that scope.

## Tips

- Keep instructions clear and actionable
- Use **MUST**, **SHOULD**, **MAY** for different requirement levels
- Provide examples where helpful
- Update instructions as patterns evolve
- Review and refactor instructions periodically
