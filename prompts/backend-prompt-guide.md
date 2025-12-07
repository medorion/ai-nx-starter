# How to Write Effective Backend Prompts

## Overview

This guide shows you how to write concise, effective prompts for backend development that leverage the **backend-dev-guidelines** skill system.

## Key Principle

**Your prompt defines WHAT to build. The skill defines HOW to build it.**

- ✅ **Prompt**: Entity fields, business rules, API requirements
- ✅ **Skill**: Implementation steps, patterns, best practices, checklist

## Skill Auto-Activation

The `backend-dev-guidelines` skill automatically activates when your prompt contains keywords like:

- CRUD, create, endpoint, API
- controller, service, DTO
- database, entity, repository
- auth, authorization, validation

You don't need to manually mention the skill - just use these keywords naturally.

---

## Prompt Template

```
Create a [CRUD/feature type] for [Entity Name] [brief description]

## Entity Fields
- field1: type (constraints, validation rules)
- field2: type (constraints, validation rules)
- relationField: reference to OtherEntity

## API Endpoints
- Standard CRUD operations
- OR list custom endpoints if non-standard

## Business Rules
- Authorization requirements (who can do what)
- Validation logic unique to this feature
- Special domain logic
- Edge cases to handle

## Special Requirements (optional)
- Performance considerations
- Integration with external services
- Deviations from standard patterns
```

---

## Example: Good vs Bad Prompts

### ❌ BAD: Over-Specified Prompt

```
Create a CRUD feature for Teams.

Steps:
1. Create TeamDto in packages/types/src/dto/features/teams/team.dto.ts
2. Create Team entity in packages/data-access-layer/src/features/team/entities/team.entity.ts
3. Create TeamDbService in packages/data-access-layer/src/features/team/services/team-db.service.ts
4. Create TeamController in apps/web-server/src/app/features/team/team.controller.ts
5. Add Swagger decorators (@ApiOperation, @ApiResponse, @ApiBearerAuth)
6. Create TeamService in apps/web-server/src/app/features/team/team.service.ts
7. Create TeamMapper in apps/web-server/src/app/features/team/team.mapper.ts
8. Write unit tests for controller, service, and mapper
9. Run npm run test
10. Run npm run test:coverage
11. Run npm run gen-api-client
12. Run npm run lint
13. Run npm run build

Entity fields:
- name: string (required, 3-100 chars)
- description: string (optional, max 500 chars)
...
```

**Problems:**

- Duplicates the skill checklist
- Wastes tokens (~500 tokens)
- Harder to maintain (checklist changes require updating all prompts)
- Mixes WHAT (requirements) with HOW (implementation steps)

### ✅ GOOD: Concise, Requirements-Focused Prompt

```
Create a CRUD feature for Teams that allows grouping users together.

## Entity Fields

- name: string (required, 3-100 chars, unique)
- description: string (optional, max 500 chars)
- ownerId: string (required, reference to User)
- memberIds: string[] (array of User IDs)
- createdAt/updatedAt: auto-managed timestamps

## API Endpoints

- GET /teams - List all teams
- GET /teams/:id - Get team with populated owner/members
- POST /teams - Create team (creator becomes owner)
- PUT /teams/:id - Update team (owner only)
- DELETE /teams/:id - Delete team (owner only)
- POST /teams/:id/members - Add member (owner only)
- DELETE /teams/:id/members/:userId - Remove member (owner only)

## Business Rules

- Creator automatically becomes owner
- Only owner can update/delete team or manage members
- Owner cannot be removed from team
- Prevent duplicate members
```

**Benefits:**

- Clear, focused on requirements
- Lets the skill handle implementation patterns
- Easy to read and understand
- Saves ~400 tokens
- Maintainable (skill updates apply automatically)

---

## When to Add More Detail

Only expand your prompt when you need to:

### 1. Override Standard Patterns

```
Note: Skip the DbService layer - this feature calls an external API instead of database.
```

### 2. Complex Business Logic

```
## Approval Workflow

When a user requests to join a team:
1. Create a TeamJoinRequest entity (pending status)
2. Notify team owner via email
3. Owner can approve/reject within 7 days
4. Auto-reject after 7 days if no response
5. Add user to memberIds only after approval
```

### 3. Performance Requirements

```
## Performance Requirements

- /teams endpoint must support pagination (100 items/page)
- Implement caching for team lookups (5 min TTL)
- Add database index on ownerId for fast owner queries
```

### 4. Integration Needs

```
## External Integration

After team creation:
- Call Slack API to create corresponding Slack channel
- Store slackChannelId in team entity
- Handle API failures gracefully (log but don't block creation)
```

---

## Common Mistakes to Avoid

### ❌ Don't Include Implementation Steps

```
BAD: "Create the controller, then create the service, then write tests..."
```

The skill checklist already defines the implementation order.

### ❌ Don't Specify File Paths

```
BAD: "Create TeamDto in packages/types/src/dto/features/teams/team.dto.ts"
```

The skill already knows the standard directory structure.

### ❌ Don't List Testing Commands

```
BAD: "Run npm run test, then npm run test:coverage, then..."
```

The skill checklist includes all verification steps.

### ❌ Don't Explain Swagger Decorators

```
BAD: "Add @ApiOperation, @ApiResponse, @ApiBearerAuth decorators..."
```

The skill's API documentation guide covers this.

---

## Real-World Examples

### Example 1: Simple CRUD

```
Create a CRUD feature for Products.

## Entity Fields

- name: string (required, 3-200 chars)
- sku: string (required, unique, uppercase)
- price: number (required, min 0)
- category: string (required, enum: Electronics|Clothing|Books)
- inStock: boolean (default: true)

## Business Rules

- Only Admin role can create/update/delete products
- Regular users can only read products
- SKU must be auto-formatted to uppercase
- Price changes should be logged
```

### Example 2: Complex Feature with Workflows

```
Create a CRUD feature for Invoices with approval workflow.

## Entity Fields

- invoiceNumber: string (auto-generated, format: INV-YYYY-MM-001)
- customerId: string (required, reference to Customer)
- items: InvoiceItem[] (at least 1 item required)
- totalAmount: number (calculated from items)
- status: enum (draft|pending|approved|rejected|paid)
- createdBy: string (reference to User)
- approvedBy: string (optional, reference to User)

## API Endpoints

- Standard CRUD for invoices
- POST /invoices/:id/submit - Submit draft for approval
- POST /invoices/:id/approve - Approve invoice (manager only)
- POST /invoices/:id/reject - Reject invoice (manager only)
- POST /invoices/:id/mark-paid - Mark as paid (finance only)

## Business Rules

- Users can only create drafts for their own invoices
- Only managers with Finance role can approve/reject
- Only Finance department can mark as paid
- totalAmount must be recalculated on item changes
- Cannot edit invoice after submission (except admin)
- invoiceNumber auto-increments per month
```

### Example 3: API Integration Feature

```
Create a feature for syncing Teams with external Slack workspace.

## Entity Fields

- teamId: string (reference to Team)
- slackChannelId: string (Slack's channel ID)
- slackWebhookUrl: string (for notifications)
- syncEnabled: boolean (default: true)
- lastSyncAt: Date

## API Endpoints

- POST /teams/:id/slack/connect - Connect team to Slack
- DELETE /teams/:id/slack/disconnect - Disconnect from Slack
- POST /teams/:id/slack/sync - Manually trigger sync

## Business Rules

- Only team owner can connect/disconnect Slack
- When team member added → post to Slack channel
- When team member removed → post to Slack channel
- Handle Slack API failures gracefully (log, don't block)
- Store Slack webhook URL encrypted

## Special Requirements

- Use Slack SDK (@slack/web-api)
- Implement retry logic (3 attempts, exponential backoff)
- Add SlackService for all Slack API calls
- Cache Slack channel info (15 min TTL)
```

---

## Checklist for Writing Your Prompt

Before submitting your prompt, verify:

- [ ] Focuses on WHAT to build, not HOW to build it
- [ ] Includes all entity fields with types and constraints
- [ ] Specifies API endpoints (if non-standard)
- [ ] Lists business rules and authorization requirements
- [ ] Mentions special requirements or deviations from standard patterns
- [ ] Uses keywords that trigger skill activation (CRUD, controller, service, etc.)
- [ ] Omits implementation steps (those are in the skill checklist)
- [ ] Omits file paths (those are in the skill guides)
- [ ] Omits testing/verification commands (those are in the skill checklist)

---

## Summary

**Write prompts like a product manager, not like a developer.**

- Describe requirements, not implementation
- Trust the skill to handle best practices
- Keep it concise and focused
- Only add detail for non-standard patterns

The skills system is designed to save you time and tokens while ensuring consistent, high-quality implementations.
