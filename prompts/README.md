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

### [frontend-prompt-guide.md](frontend-prompt-guide.md)

Learn how to write effective frontend UI prompts that work with the `frontend-dev-guidelines` skill.

**Key topics:**

- Prompt template and structure
- Good vs bad examples
- When to add more detail
- Real-world examples (list pages, forms, dashboards, data tables)
- Common mistakes to avoid

### [example-activity-logs-feature.md](example-activity-logs-feature.md)

Complete end-to-end example prompt for a full-stack Activity Logs feature that triggers both backend and frontend skills.

**What's included:**

- Backend API with read-only endpoints, pagination, filtering
- Frontend dashboard with table, filters, search, export
- Complete business rules and authorization
- UI/UX specifications
- Performance considerations

**Use this as a template** for creating your own full-stack features.

## Philosophy

**Skills define HOW. Prompts define WHAT.**

The skills system (`.claude/skills/`) contains implementation patterns, checklists, and best practices. Your prompts should focus on:

**Backend:**

- Entity requirements
- Business rules
- API endpoints
- Authorization logic
- Special cases

**Frontend:**

- UI requirements
- User interactions
- Data to display
- Validation rules
- Navigation flows

Let the skills handle:

- Implementation steps
- File structure
- Code patterns (Angular/NestJS)
- Component/service structure
- Testing approach
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

### Minimal Frontend Prompt

```
Create a [page/component] for [Feature].

## UI Requirements
- What to display (fields, layout)
- Visual states (loading, empty, error)

## User Interactions
- Actions users can perform
- Forms and validation

## Data Requirements
- What to fetch from API
- When to fetch data
```

### When to Expand

Only add detail for:

- Non-standard patterns
- Complex workflows/UI flows
- External integrations
- Performance requirements

## See Also

- `.claude/skills/` - Implementation patterns and checklists
- `CLAUDE.md` - Quick reference for AI agents
- `README.md` - Project overview
