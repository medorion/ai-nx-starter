# Dev Docs Pattern

A methodology for maintaining project context across Claude Code sessions and context resets.

---

## The Problem

**Context resets lose everything:**

- Implementation decisions
- Key files and their purposes
- Task progress
- Technical constraints
- Why certain approaches were chosen

**After a reset, Claude has to rediscover everything.**

---

## The Solution: Persistent Dev Docs

A three-file structure that captures everything needed to resume work:

```
dev/active/[task-name]/
├── plan.md      # Strategic plan from plan mode
├── context.md   # Key decisions & files
└── tasks.md     # Checklist format for tracking
```

**These files survive context resets** - Claude reads them to get back up to speed instantly.

---

## Workflow Overview

1. **Use Claude Code's plan mode** to create a comprehensive plan
2. **Exit plan mode** when planning is complete
3. **Run `/dev-docs [task-name]`** to transform the plan into trackable docs
4. **Work on the task**, checking off items in `tasks.md`
5. **Run `/dev-docs-update [task-name]`** periodically to checkpoint progress
6. **After context reset**, Claude reads the three files and resumes instantly

---

## Three-File Structure

### 1. plan.md

**Purpose:** Strategic plan created in Claude Code's plan mode

**Contains:**

- Complete plan output from plan mode
- Metadata header with status and timestamps
- Overview and objectives
- Implementation phases and steps
- Files to create/modify
- Technical considerations
- Risks and constraints

**When to create:** Automatically created by `/dev-docs` command from plan mode output

**When to update:** When scope changes significantly or new phases discovered

**Example:**

```markdown
# Feature Name - Implementation Plan

## Executive Summary

What we're building and why

## Current State

Where we are now

## Implementation Phases

### Phase 1: Infrastructure (2 hours)

- Task 1.1: Set up database schema
  - Acceptance: Schema compiles, relationships correct
- Task 1.2: Create service structure
  - Acceptance: All directories created

### Phase 2: Core Functionality (3 hours)

...
```

---

### 2. context.md

**Purpose:** Key information for resuming work

**Contains:**

- Critical files and their purposes
- Architectural decisions made during implementation
- Dependencies (packages, services, internal)
- Risks and mitigation strategies
- Key constraints (technical, business, resource)
- Quick links to related docs/PRs/issues

**When to create:** Automatically created by `/dev-docs` from plan mode output

**When to update:** Via `/dev-docs-update` when new decisions or files emerge

**Example:**

```markdown
# Feature Name - Context

## SESSION PROGRESS (2025-10-29)

### ✅ COMPLETED

- Database schema created (User, Post, Comment models)
- PostController implemented with BaseController pattern
- Sentry integration working

### 🟡 IN PROGRESS

- Creating PostService with business logic
- File: src/services/postService.ts

### ⚠️ BLOCKERS

- Need to decide on caching strategy

## Key Files

**apps/web-server/src/app/features/user/user.controller.ts**

- Handles HTTP requests
- Delegates to UserService

**apps/web-server/src/app/features/user/user.service.ts** (IN PROGRESS)

- Business logic for post operations
- Next: Add caching

## Quick Resume

To continue:

1. Read this file
2. Continue implementing UserService.create()
3. See tasks file for remaining work
```

**CRITICAL:** Update the SESSION PROGRESS section every time significant work is done!

---

### 3. tasks.md

**Purpose:** Actionable checklist for tracking progress

**Contains:**

- Progress percentage (X/Y tasks completed)
- Phases broken down by logical sections
- Tasks in checkbox format `- [ ]` / `- [x]`
- File paths for each task
- Acceptance criteria
- Task dependencies
- Progress notes section (dated entries)

**When to create:** Automatically created by `/dev-docs` from plan mode tasks

**When to update:** Via `/dev-docs-update` after completing tasks or milestones

**Example:**

```markdown
# Feature Name - Task Checklist

## Phase 1: Setup ✅ COMPLETE

- [x] Create dto schema
- [x] Create entity
- [x] Set up controllers

## Phase 2: Implementation 🟡 IN PROGRESS

- [x] Create UserDbService
- [x] Create UserController
- [ ] Create UserService (IN PROGRESS)
- [ ] Create UserMapper
- [ ] register new DbService

## Phase 3: Testing ⏳ NOT STARTED

- [ ] Unit tests
- [ ] Verify all tests pass
- [ ] Verify Code coverage

## Phase 4: Finalize API Endpoints ⏳ NOT STARTED

- [ ] Write API Endpoint documentation
- [ ] Generate Client API

## Phase 5: Verify Build ⏳ NOT STARTED

- [ ] Verify Format
- [ ] Verify Lint
- [ ] Verify Build
```

---

## When to Use Dev Docs

**Use for:**

- ✅ Complex multi-day tasks
- ✅ Features with many moving parts
- ✅ Tasks likely to span multiple sessions
- ✅ Work that needs careful planning
- ✅ Refactoring large systems

**Skip for:**

- ❌ Simple bug fixes
- ❌ Single-file changes
- ❌ Quick updates
- ❌ Trivial modifications

**Rule of thumb:** If it takes more than 2 hours or spans multiple sessions, use dev docs.

---

## Workflow with Dev Docs

### Starting a New Task

1. **Enter plan mode to create a comprehensive plan:**

   ```
   I need help implementing [feature]. Can you enter plan mode and create a plan?
   ```

   - Claude explores the codebase
   - Analyzes requirements and constraints
   - Creates detailed implementation plan
   - Outputs plan in the chat

2. **Exit plan mode and document the plan:**

   ```
   /dev-docs [task-name]
   ```

   - Claude extracts the plan from conversation
   - Creates `dev/active/[task-name]/` directory
   - Generates three files: plan.md, context.md, tasks.md

3. **Review the documentation:**
   - Check `plan.md` for overall strategy
   - Review `tasks.md` for actionable steps
   - Verify `context.md` has all critical info

### During Implementation

1. **Refer to `plan.md`** for overall strategy and approach
2. **Work through tasks** in `tasks.md` sequentially
3. **Manually check off tasks** as you complete them (edit the file directly)
4. **Periodically run `/dev-docs-update [task-name]`** to:
   - Automatically update task completion status
   - Add progress notes with timestamps
   - Capture new decisions and file changes
   - Update context with discoveries

### After Context Reset

1. **Claude reads all three files**
2. **Understands complete state** in seconds
3. **Resumes exactly where you left off**

No need to explain what you were doing - it's all documented!

---

## Integration with Slash Commands

### /dev-docs

**Transforms plan mode output into trackable documentation**

**Prerequisites:** You must have recently exited plan mode with a plan in the conversation

**Usage:**

```
/dev-docs [task-name]
```

Example:

```
/dev-docs auth-refactor
```

**What it does:**

1. Looks back in conversation for plan mode output
2. Extracts the complete plan
3. Creates `dev/active/auth-refactor/` directory
4. Generates three files:
   - `plan.md` - Complete plan with metadata
   - `context.md` - Critical files, decisions, dependencies
   - `tasks.md` - Actionable checklist with progress tracking

**When to use:** Immediately after exiting plan mode

---

### /dev-docs-update

**Updates existing dev docs with progress**

**Prerequisites:** Dev docs must already exist for the task

**Usage:**

```
/dev-docs-update [task-name]
```

Example:

```
/dev-docs-update auth-refactor
```

**What it does:**

1. Reads existing documentation in `dev/active/[task-name]/`
2. Analyzes recent work in conversation
3. Updates `tasks.md`:
   - Checks off completed tasks
   - Updates progress percentage
   - Adds dated progress notes
4. Updates `context.md` with new decisions/files
5. Updates `plan.md` metadata (status, timestamp)

**When to use:**

- Before long breaks or context resets
- After completing major milestones
- When switching to different tasks
- Periodically during long implementations

---

## File Organization

```
dev/
├── README.md              # This file (dev docs pattern guide)
├── active/                # Current work
│   ├── auth-refactor/
│   │   ├── plan.md       # Strategic plan from plan mode
│   │   ├── context.md    # Key decisions and files
│   │   └── tasks.md      # Progress tracking checklist
│   └── api-migration/
│       ├── plan.md
│       ├── context.md
│       └── tasks.md
└── archive/               # Completed work (optional)
    └── completed-task/
        ├── plan.md
        ├── context.md
        └── tasks.md
```

**active/**: Work in progress - actively tracked tasks
**archive/**: Completed tasks (move here when done, for future reference)

---

## Best Practices

### Update Progress Regularly

**Bad:** Only update at end of long session
**Good:** Run `/dev-docs-update [task-name]` after each major milestone

**Benefits of frequent updates:**

- Checkpoints your work before context resets
- Creates audit trail of decisions
- Makes it easy to resume after interruptions
- Prevents lost work

**When to update:**

- After completing 2-3 tasks
- Before taking a break
- When making important architectural decisions
- Before switching to another task

### Make Tasks Actionable

**Bad:** "Fix the authentication"
**Good:** "Implement JWT token validation in AuthMiddleware.ts (Acceptance: Tokens validated, errors to Sentry)"

**Include:**

- Specific file names
- Clear acceptance criteria
- Dependencies on other tasks

### Keep Plan Current

If scope changes:

- Update the plan
- Add new phases
- Adjust timeline estimates
- Note why scope changed

---

## For Claude Code

**When user runs `/dev-docs [task-name]`:**

1. **Look back in conversation** to find the most recent plan mode output
2. **Extract the complete plan** (all sections, don't summarize)
3. **Create directory:** `dev/active/[task-name]/`
4. **Generate three files:**
   - `plan.md` - Copy plan with metadata header
   - `context.md` - Extract critical files, decisions, dependencies, risks
   - `tasks.md` - Convert plan steps into actionable checklist
5. **Make tasks.md comprehensive:**
   - Every task from the plan becomes a checkbox item
   - Include file paths, acceptance criteria, dependencies
   - Add progress tracking section
6. **Tell user where files were created** and how to use them

**When user runs `/dev-docs-update [task-name]`:**

1. **Read all three files** from `dev/active/[task-name]/`
2. **Analyze recent conversation** for:
   - Completed tasks
   - New files created/modified
   - Architectural decisions made
   - Blockers encountered
3. **Update `tasks.md`:**
   - Check off completed items
   - Update progress percentage
   - Add dated progress notes
4. **Update `context.md`** if new info emerged
5. **Update `plan.md`** metadata (timestamp, status)
6. **Summarize progress** for the user

**When resuming from dev docs after context reset:**

1. **Read all three files** in order: `context.md` → `tasks.md` → `plan.md`
2. **Understand current state:**
   - What's been completed (checked boxes in tasks.md)
   - What's in progress (latest progress notes)
   - What's next (unchecked tasks)
3. **Reference `plan.md`** for overall strategy and approach
4. **Continue from where work left off** - no need to ask user for recap

---

## Benefits

**Before dev docs:**

- Context reset = start over
- Forget why decisions were made
- Lose track of progress
- Repeat work

**After dev docs:**

- Context reset = read 3 files, resume instantly
- Decisions documented
- Progress tracked
- No repeated work

**Time saved:** Hours per context reset

---

## Active Tasks

- **[teams]** - Team Management Feature (Backend CRUD API + Frontend UI) - Started: 2026-01-06
  - Path: `dev/active/teams/`
  - Status: Not Started
  - Progress: 0/55 tasks (0%)
  - Next: Phase 1 - Backend Foundation (Create DTOs)
