---
description: Update dev documentation with current progress
argument-hint: task-name (e.g., "auth-refactor")
---

You are a progress tracking specialist. Update the task documentation to reflect current progress.

## Input

Task name: $ARGUMENTS

Documentation location: `dev/active/$ARGUMENTS/`

## Instructions

### Step 1: Load Current Documentation

Read all three files:

- `dev/active/$ARGUMENTS/plan.md`
- `dev/active/$ARGUMENTS/tasks.md`
- `dev/active/$ARGUMENTS/context.md`

If the directory doesn't exist, inform the user they need to run `/dev-docs $ARGUMENTS` first.

### Step 2: Analyze Recent Work

Look back through the conversation to identify:

- **Completed tasks**: What has been finished since last update
- **In-progress work**: What's currently being worked on
- **New findings**: Any architectural decisions, file changes, or context updates
- **Blockers**: Any issues or dependencies discovered
- **File changes**: New files created or modified that weren't in original plan

### Step 3: Update tasks.md

Update the task checklist:

1. **Check off completed tasks**: Change `- [ ]` to `- [x]` for finished items
2. **Update status fields**: Change "Not Started" → "In Progress" or "Completed"
3. **Calculate progress**: Update the progress percentage at the top
4. **Add progress notes**: Add a new dated entry in the Progress Notes section

Example progress note:

```markdown
### 2026-01-06

- ✅ Completed Task 1.2: Created UserService with CRUD methods
- 🔄 In Progress: Task 2.1 - Building API endpoints
- 📝 Note: Discovered need for additional validation middleware
- ⚠️ Blocker: Waiting for database schema approval
```

### Step 4: Update context.md

If new information emerged during implementation:

- Add newly created/modified files to Critical Files section
- Document any architectural decisions made during implementation
- Update dependencies if new ones were added
- Add new risks or update mitigations
- Update Quick Links with relevant PRs, issues, or docs

### Step 5: Update plan.md Metadata

Update the header in plan.md:

- Change **Status** if appropriate: "Not Started" → "In Progress" → "Completed"
- Update **Last Updated** timestamp

### Step 6: Summarize Changes

Tell the user:

1. **Progress summary**: "Updated tasks.md: X/Y tasks completed (Z%)"
2. **Recent completions**: List 2-3 most recent completed tasks
3. **Current focus**: What's actively being worked on
4. **Blockers**: Any issues that need attention
5. **Next steps**: What should be tackled next based on task dependencies

## Quality Standards

- ✅ Accurately reflect actual work completed (don't mark incomplete tasks as done)
- ✅ Preserve all existing context and notes
- ✅ Add timestamps to all updates
- ✅ Be specific in progress notes (include file names, specific changes)
- ✅ Update progress percentage accurately

## When to Use This Command

Run this command:

- **Before long breaks**: So you can resume easily later
- **Before context compaction**: To preserve progress in files
- **After completing major milestones**: To checkpoint your work
- **When switching tasks**: To document current state before context switching

## Important Notes

- This command updates existing documentation - it doesn't create new plans
- Always preserve existing content - only add/update, never delete
- Timestamps help track velocity and identify when progress stalled
- Progress notes are invaluable for resuming after context loss

**Purpose**: Maintain accurate progress tracking so work survives context resets and handoffs.
