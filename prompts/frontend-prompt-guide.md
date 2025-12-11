# How to Write Effective Frontend Prompts

## Overview

This guide shows you how to write concise, effective prompts for frontend development that leverage the **frontend-dev-guidelines** skill system.

## Key Principle

**Your prompt defines WHAT to build. The skill defines HOW to build it.**

- ✅ **Prompt**: UI requirements, data to display, user interactions, business rules
- ✅ **Skill**: Implementation patterns, component structure, RxJS usage, NG-ZORRO components, best practices

## Skill Auto-Activation

The `frontend-dev-guidelines` skill automatically activates when your prompt contains keywords like:

- component, page, UI, interface
- form, table, modal, dialog
- Angular, NG-ZORRO, RxJS
- routing, lazy loading
- data fetching, state management
- styling, LESS, theme

You don't need to manually mention the skill - just use these keywords naturally.

---

## Prompt Template

```
Create a [component/page/feature type] for [Feature Name] [brief description]

## UI Requirements
- What data to display (fields, format, computed values)
- Layout/structure (list, grid, tabs, cards, etc.)
- Visual states (loading, empty, error)
- Responsive behavior (if non-standard)

## User Interactions
- Actions users can perform (view, edit, delete, filter, etc.)
- Forms and validation rules
- Navigation flow
- Confirmation dialogs for destructive actions

## Data Requirements
- What data to fetch (from which API endpoints)
- When to fetch (on load, on action, on route change)
- Data transformations needed
- Caching strategy (if non-standard)

## Business Rules
- Authorization (who can see/do what)
- Validation logic
- Edge cases to handle
- Special domain logic

## Special Requirements (optional)
- Performance considerations (virtual scrolling, pagination)
- Third-party integrations
- Deviations from standard patterns
```

---

## Example: Good vs Bad Prompts

### ❌ BAD: Over-Specified Prompt

```
Create a user list component.

Steps:
1. Create user-list.component.ts in apps/web-ui/src/app/features/users/components/
2. Use @Component decorator with standalone: true
3. Add ChangeDetectionStrategy.OnPush
4. Import CommonModule, NzTableModule, NzButtonModule, NzInputModule
5. Create user-list.component.html with nz-table
6. Create user-list.component.less with LESS variables
7. Inject ApiUserService from @ai-nx-starter/api-client
8. Create BehaviorSubject for users
9. Use takeUntilDestroyed for subscriptions
10. Add trackBy function for *ngFor
11. Use debounceTime(300) for search
12. Add OnPush change detection
13. Use nz-spin for loading states
...
```

**Problems:**

- Duplicates the skill checklist and component patterns
- Wastes tokens (~600 tokens)
- Harder to maintain (pattern changes require updating all prompts)
- Mixes WHAT (UI requirements) with HOW (implementation details)

### ✅ GOOD: Concise, Requirements-Focused Prompt

```
Create a user list page with search, filtering, and CRUD actions.

## UI Requirements

- Display users in a table with columns: name, email, role, created date
- Search bar to filter by name/email (client-side)
- Filter dropdown for role (All, User, Admin, SuperAdmin)
- Action buttons per row: View, Edit, Delete
- "Create User" button in page header
- Show loading spinner while fetching
- Show empty state when no users match filters

## User Interactions

- Click row to view user details (navigate to /users/:id)
- Edit button navigates to /users/:id/edit
- Delete button shows confirmation dialog before deleting
- Search updates as user types (debounced)
- Filter dropdown updates immediately

## Data Requirements

- Fetch all users on page load using ApiUserService.getUsers()
- Cache user list for 5 minutes (use BehaviorSubject service)
- After delete, refresh the list

## Business Rules

- Only Admin role can create/edit/delete users
- Hide action buttons for unauthorized users
- Show user count in page header
```

**Benefits:**

- Clear, focused on UI requirements and user interactions
- Lets the skill handle Angular/NG-ZORRO implementation
- Easy to read and understand
- Saves ~500 tokens
- Maintainable (skill updates apply automatically)

---

## When to Add More Detail

Only expand your prompt when you need to:

### 1. Override Standard Patterns

```
Note: Use manual subscriptions instead of async pipe for this component due to complex
state management needs across multiple child components.
```

### 2. Complex UI/UX Logic

```
## Multi-Step Form Flow

1. Step 1: Basic Info (name, email) - validate before proceeding
2. Step 2: Role Selection - show different fields based on role
3. Step 3: Permissions - checkboxes depend on role from step 2
4. Step 4: Review - show summary of all steps
5. Final submit sends all data to API at once
6. Show progress indicator (1/4, 2/4, etc.)
```

### 3. Performance Requirements

```
## Performance Requirements

- Use virtual scrolling for lists >100 items
- Implement infinite scroll (load 50 items at a time)
- Add pagination controls for tables
- Lazy load heavy NG-ZORRO components (DatePicker, RichTextEditor)
```

### 4. Complex State Management

```
## State Management

- User selection persists across page navigation (use global service)
- Filter state stored in URL query params
- Maintain scroll position when navigating back from detail page
- Sync selection state with localStorage
```

---

## Common Mistakes to Avoid

### ❌ Don't Include Implementation Steps

```
BAD: "Create the component, then add OnPush, then inject services..."
```

The skill checklist already defines the implementation order.

### ❌ Don't Specify File Paths

```
BAD: "Create user-list.component.ts in apps/web-ui/src/app/features/users/components/"
```

The skill already knows the standard directory structure.

### ❌ Don't List NG-ZORRO Components to Use

```
BAD: "Use NzTableModule, NzButtonModule, NzInputModule, NzModalModule..."
```

The skill knows which NG-ZORRO components fit the requirements.

### ❌ Don't Specify RxJS Patterns

```
BAD: "Use BehaviorSubject with takeUntilDestroyed and debounceTime(300)..."
```

The skill's data fetching guide covers RxJS patterns.

### ❌ Don't Explain LESS Styling Syntax

```
BAD: "Use @padding-md for spacing, @primary-color for buttons..."
```

The skill's styling guide covers theme variables.

---

## Real-World Examples

### Example 1: Simple List Page

```
Create a products list page with basic CRUD operations.

## UI Requirements

- Display products in a grid (3 columns on desktop, 1 on mobile)
- Show product card: image, name, SKU, price, stock status
- "Add Product" button in header
- Visual indicator for out-of-stock items (grayed out)
- Loading skeleton while fetching

## User Interactions

- Click card to view product details
- Edit button (admin only) navigates to edit page
- Delete button (admin only) shows confirmation
- Search by name or SKU

## Data Requirements

- Fetch products using ApiProductService.getProducts()
- Refresh after create/update/delete

## Business Rules

- Only Admin role can create/edit/delete
- Regular users see read-only view
- Show stock status badge (In Stock / Out of Stock)
```

### Example 2: Complex Form with Validation

```
Create a user registration form with multi-step validation.

## UI Requirements

- Two-step form with progress indicator
- Step 1: Account Info (email, password, confirm password)
- Step 2: Profile Info (first name, last name, avatar upload, role)
- "Back" and "Next" buttons
- "Submit" button on final step
- Show validation errors inline

## User Interactions

- Can't proceed to step 2 until step 1 is valid
- Password strength indicator (weak/medium/strong)
- Avatar upload with preview and size limit (2MB)
- Submit creates user and navigates to user list

## Validation Rules

- Email: required, valid format, unique (check via API)
- Password: required, min 8 chars, must include uppercase, lowercase, number, special char
- Confirm Password: must match password
- First/Last Name: required, min 2 chars
- Avatar: optional, max 2MB, jpg/png only
- Role: required, dropdown (User/Admin/SuperAdmin)

## Data Requirements

- Check email uniqueness: ApiUserService.checkEmailExists(email)
- Submit form: ApiUserService.createUser(dto)
- Upload avatar first, get URL, include in user DTO

## Business Rules

- Only Admin can create users with Admin/SuperAdmin roles
- Regular users can only create User role accounts
- Show role dropdown options based on current user's role
```

### Example 3: Dashboard with Real-Time Data

```
Create a dashboard page showing team metrics and activity.

## UI Requirements

- Grid layout with 4 metric cards (total users, active teams, pending requests, revenue)
- Chart showing user signups over last 30 days (line chart)
- Recent activity feed (last 10 activities)
- Refresh button in header
- Auto-refresh every 5 minutes
- Loading states for each section independently

## User Interactions

- Click metric card to navigate to detailed view
- Click activity item to navigate to related page
- Manual refresh via button
- Date range selector for chart (7 days, 30 days, 90 days)

## Data Requirements

- Fetch metrics: ApiDashboardService.getMetrics()
- Fetch chart data: ApiDashboardService.getUserSignups(dateRange)
- Fetch activity: ApiDashboardService.getRecentActivity()
- All endpoints called in parallel on load
- Auto-refresh all data every 5 minutes

## Business Rules

- Only Admin and Manager roles can view dashboard
- Metrics update in real-time (show loading only for first load)
- Activity feed shows user-friendly timestamps (2 mins ago, 1 hour ago)
- Chart supports zoom and pan

## Special Requirements

- Use NG-ZORRO Charts (nz-line-chart)
- Implement interval-based auto-refresh with cleanup on destroy
- Cache metrics data for 1 minute to reduce API calls
```

### Example 4: Data Table with Advanced Features

```
Create a user management table with sorting, filtering, and inline editing.

## UI Requirements

- Table columns: checkbox, avatar, name, email, role, status, created date, actions
- Column sorting (click header to sort)
- Multi-row selection with bulk actions
- Inline editing for name and role (double-click to edit)
- Pagination (25 items per page)
- Column visibility toggle (hide/show columns)

## User Interactions

- Click checkbox to select row(s)
- "Select All" checkbox in header
- Bulk actions: Delete Selected, Export Selected
- Double-click cell to edit inline
- Click "Save" to commit, "Cancel" to revert
- Sort by clicking column headers
- Filter panel: role dropdown, status toggle, date range

## Data Requirements

- Fetch users: ApiUserService.getUsers(page, pageSize, filters, sortBy)
- Server-side pagination, sorting, and filtering
- Update user: ApiUserService.updateUser(id, changes)
- Bulk delete: ApiUserService.bulkDelete(ids[])

## Business Rules

- Only Admin can edit/delete users
- Can't delete your own account
- Inline edit validates before saving
- Show confirmation for bulk delete
- Export generates CSV of selected users

## Special Requirements

- Implement virtual scrolling for >1000 users
- Debounce filter inputs (500ms)
- Show unsaved changes indicator during inline edit
- Persist filter/sort state in URL query params
```

---

## Checklist for Writing Your Prompt

Before submitting your prompt, verify:

- [ ] Focuses on WHAT to build (UI, interactions), not HOW to build it
- [ ] Describes UI requirements clearly (layout, data display, visual states)
- [ ] Lists user interactions and navigation flows
- [ ] Specifies data requirements (what to fetch, when to fetch)
- [ ] Includes validation rules for forms
- [ ] Lists business rules and authorization requirements
- [ ] Mentions special requirements or deviations from standard patterns
- [ ] Uses keywords that trigger skill activation (component, form, table, etc.)
- [ ] Omits implementation details (component structure, RxJS patterns)
- [ ] Omits file paths and directory structure
- [ ] Omits NG-ZORRO component names and imports
- [ ] Omits LESS styling syntax and theme variables

---

## Summary

**Write prompts like a UX designer, not like a developer.**

- Describe UI requirements and user flows, not implementation
- Trust the skill to handle Angular/NG-ZORRO best practices
- Keep it concise and focused on user experience
- Only add detail for complex UI logic or non-standard patterns

The skills system is designed to save you time and tokens while ensuring consistent, high-quality Angular implementations.
