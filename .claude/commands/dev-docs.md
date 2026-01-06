---
description: Convert plan mode output into trackable documentation structure
argument-hint: task-name (e.g., "auth-refactor", "microservices-migration")
---

You are a documentation specialist. Transform the plan from Claude Code's plan mode into a structured, trackable format.

## Workflow Context

The user just exited plan mode where you created a comprehensive plan in the chat output. Now you need to:

1. Extract that plan from the recent conversation
2. Document it in a persistent, trackable structure
3. Create actionable checklists for progress monitoring

## Input

Task name: $ARGUMENTS (will be used for directory name: `dev/active/$ARGUMENTS/`)

## Instructions

### Step 1: Locate the Plan

Look back in the conversation history to find:

- The most recent plan mode output you created
- It typically contains sections like: Overview, Implementation Steps, Files to Modify, etc.
- Extract the COMPLETE plan content

If you cannot find a recent plan in the conversation, ask the user to either:

- Re-run the planning in plan mode, OR
- Paste the plan content directly

### Step 2: Extract Key Information

From the plan, identify and extract:

- **All actionable tasks and subtasks** (with sequence/priority)
- **Critical files** that will be created or modified
- **Dependencies** between tasks and external dependencies
- **Architectural decisions** or design choices made
- **Risks and mitigations** mentioned in the plan
- **Acceptance criteria** for each major task
- **Key context** needed to understand the plan

### Step 3: Create Documentation Structure

Create directory: `dev/active/$ARGUMENTS/` and generate three files:

#### File 1: `plan.md`

```markdown
# Plan: [Task Name]

**Status**: Not Started
**Created**: YYYY-MM-DD HH:MM
**Last Updated**: YYYY-MM-DD HH:MM

---

[Copy of the complete plan from plan mode, preserving all sections and formatting]
```

#### File 2: `tasks.md` (Actionable Checklist)

```markdown
# Task Checklist: [Task Name]

**Last Updated**: YYYY-MM-DD HH:MM
**Progress**: 0/X tasks completed (0%)

---

## Phase 1: [Phase Name]

- [ ] **Task 1.1**: Description
  - **Files**: `path/to/file1.ts`, `path/to/file2.ts`
  - **Acceptance**: What done looks like
  - **Dependencies**: None | Task X.Y
  - **Status**: Not Started

- [ ] **Task 1.2**: Description
  - **Files**: `path/to/file3.ts`
  - **Acceptance**: Specific completion criteria
  - **Dependencies**: Task 1.1
  - **Status**: Not Started

## Phase 2: [Phase Name]

[Continue for all phases...]

---

## Progress Notes

### [YYYY-MM-DD]

- Started work on...
- Completed Task X.Y
- Blocker: ...

[Add dated notes as work progresses]
```

#### File 3: `context.md` (Quick Reference)

```markdown
# Context: [Task Name]

**Last Updated**: YYYY-MM-DD HH:MM

---

## Critical Files

### Files to Create

- `path/to/new-file.ts` - Purpose and role

### Files to Modify

- `path/to/existing-file.ts` - What changes and why

---

## Architectural Decisions

1. **Decision**: [e.g., "Use repository pattern for data access"]
   - **Reasoning**: [Why this choice]
   - **Trade-offs**: [What we're giving up]

---

## Dependencies

### Package Dependencies

- `@package/name@version` - Purpose

### External Services

- Service name - How it's used

### Internal Dependencies

- Must complete Task X before Task Y

---

## Risks & Mitigations

| Risk               | Impact       | Mitigation      |
| ------------------ | ------------ | --------------- |
| [Risk description] | High/Med/Low | [How to handle] |

---

## Key Constraints

- Technical constraints (e.g., "Must maintain backwards compatibility")
- Business constraints (e.g., "Launch deadline: MM/DD")
- Resource constraints (e.g., "No new infrastructure")

---

## Quick Links

- Related docs: [path/to/docs]
- Design specs: [link]
- Related PRs/issues: [link]
```

### Step 4: Update dev/README.md

If `dev/README.md` exists, add an entry for this task:

```markdown
## Active Tasks

- **[$ARGUMENTS]** - [Brief description] - Started: YYYY-MM-DD
  - Path: `dev/active/$ARGUMENTS/`
  - Status: Not Started
```

If it doesn't exist, create it with a task tracking template.

### Step 5: Summarize for User

After creating the documentation, tell the user:

1. **Location**: "Created documentation in `dev/active/$ARGUMENTS/`"
2. **Files created**:
   - `plan.md` - Full plan with metadata
   - `tasks.md` - Actionable checklist to track progress
   - `context.md` - Quick reference for key decisions and files
3. **Next steps**:
   - "Check off tasks in `tasks.md` as you complete them"
   - "Add progress notes to the Progress Notes section"
   - "Use `/dev-docs-update $ARGUMENTS` to sync progress (if that command exists)"
4. **Recovery**: "This structure survives context resets - just reference these files to resume work"

## Quality Standards

- ✅ Extract EVERY task from the plan (don't summarize)
- ✅ Include specific file paths whenever mentioned
- ✅ Make each task independently actionable
- ✅ Preserve all technical context and rationale
- ✅ Use consistent markdown formatting
- ✅ Include timestamps for tracking
- ✅ Make it easy to resume after context loss

## Important Notes

- This command is designed to run IMMEDIATELY after exiting plan mode
- The plan should still be visible in recent conversation history
- If too much time has passed, ask user to re-share the plan
- Don't modify or "improve" the original plan - preserve it exactly

**Purpose**: Create persistent, trackable documentation from ephemeral plan mode output so progress survives context resets.
