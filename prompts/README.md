# Prompts Directory

## Purpose

This directory contains **prompt writing guides** that help you create effective, concise prompts for AI-assisted development using the skills system.

## Available Guides

### [backend-prompt-guide.md](backend-prompt-guide.md)

Learn how to write effective backend feature prompts that work with the `backend-dev-guidelines` skill.

**Key topics:**

- Prompt template and structure
- Good vs bad examples
- When to add more detail
- Real-world examples (simple CRUD, workflows, integrations)
- Common mistakes to avoid

## Philosophy

**Skills define HOW. Prompts define WHAT.**

The skills system (`.claude/skills/`) contains implementation patterns, checklists, and best practices. Your prompts should focus on:

- Entity requirements
- Business rules
- API endpoints
- Authorization logic
- Special cases

Let the skills handle:

- Implementation steps
- File structure
- Testing approach
- Code patterns
- Verification commands

## Quick Reference

### Minimal Backend Prompt

```
Create a CRUD feature for [Entity].

## Entity Fields
- field: type (constraints)

## Business Rules
- Authorization requirements
- Validation logic
```

### When to Expand

Only add detail for:

- Non-standard patterns
- Complex workflows
- External integrations
- Performance requirements

## See Also

- `.claude/skills/` - Implementation patterns and checklists
- `CLAUDE.md` - Quick reference for AI agents
- `README.md` - Project overview
