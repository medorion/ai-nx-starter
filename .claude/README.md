# Claude Code Configuration

This directory contains hierarchical instructions for Claude Code, an AI coding assistant.

## How It Works

Claude Code automatically reads `instructions.md` files from the current directory and all parent directories up to the project root. This creates **context-aware AI assistance** - global rules plus scope-specific rules.

## Directory Structure

```
.claude/
├── instructions.md          # Global project rules
└── README.md               # This file (for humans)

apps/web-ui/.claude/
└── instructions.md          # Angular-specific rules

apps/web-server/.claude/
└── instructions.md          # NestJS-specific rules

packages/*/. claude/
└── instructions.md          # Package-specific rules
```

## Rule Hierarchy

When working in `apps/web-server/src/app/features/user/`:

1. ✅ Root `.claude/instructions.md` (global rules: pnpm, formatting, testing)
2. ✅ `apps/web-server/.claude/instructions.md` (NestJS, controllers, validation)

More specific rules take precedence over general rules.

## Maintaining Instructions

### Edit Existing Rules

- **Global rules** (all code): Edit `.claude/instructions.md` at project root
- **App/package rules**: Edit `.claude/instructions.md` in that app/package directory

### Add New App/Package

When creating a new app or package:

```bash
mkdir -p apps/new-app/.claude
touch apps/new-app/.claude/instructions.md
```

Then add app-specific patterns, naming conventions, and architectural rules.

## Best Practices

- Keep instructions **concise** - point to `/documents/` for detailed patterns
- Use **MUST/SHOULD/MAY** to indicate requirement levels
- Provide **examples** for complex patterns
- Update as the codebase evolves
