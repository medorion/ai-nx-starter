# Activity Logs Feature - Full Stack Example

**⚠️ IMPORTANT: If using this file in Claude Code, start with:**

```
Use the backend-dev-guidelines skill and frontend-dev-guidelines skill to implement this feature.
```

Then paste or reference this file content.

---

This is a complete end-to-end example showing how to request a full-stack feature with proper backend and frontend requirements.

---

## Backend: Activity Logs API

Create a read-only API for Activity Logs that tracks user actions across the system.

### Entity Fields

- id: string (auto-generated UUID)
- userId: string (required, reference to User)
- action: string (required, e.g., "USER_CREATED", "TEAM_UPDATED", "LOGIN_SUCCESS")
- entityType: string (optional, e.g., "User", "Team", "Post")
- entityId: string (optional, ID of affected entity)
- metadata: object (optional, additional context as JSON)
- ipAddress: string (optional, user's IP address)
- userAgent: string (optional, browser/client info)
- timestamp: Date (auto-generated, indexed for queries)

### API Endpoints

- GET /activity-logs - List all logs with pagination, filtering, and sorting
  - Query params: page, pageSize, userId, action, entityType, startDate, endDate, sortBy, sortOrder
- GET /activity-logs/:id - Get single log entry with populated user details
- GET /activity-logs/user/:userId - Get logs for specific user (paginated)

**Note:** No create/update/delete endpoints - logs are created internally by the system, not via API.

### Business Rules

- Only Admin role can view activity logs
- Logs are immutable (no updates or deletes)
- Pagination required (default: 50 items per page, max: 100)
- Date range filtering required for performance (default: last 30 days)
- Return populated user info (name, email) in responses
- Sort by timestamp descending by default

### Special Requirements

- Add database indexes on: userId, action, entityType, timestamp
- Implement efficient date range queries
- Consider data retention policy (e.g., auto-delete logs older than 1 year)

---

## Frontend: Activity Logs Dashboard

Create an activity logs dashboard page for administrators to view and filter system activity.

### UI Requirements

- Display logs in a table with columns:
  - Timestamp (formatted as "MMM DD, YYYY HH:mm:ss")
  - User (name with avatar, email in tooltip)
  - Action (badge with color coding)
  - Entity (type + ID as link if applicable)
  - IP Address
  - Details button (opens modal with full metadata)
- Date range picker (default: last 7 days)
- Filter dropdowns:
  - Action type (multi-select)
  - Entity type (multi-select)
  - User (searchable select)
- Search input for free-text search across action/entity
- Loading spinner while fetching
- Empty state when no logs match filters
- Server-side pagination controls (50 items per page)

### User Interactions

- Click row to expand inline details panel showing metadata
- Click user name to navigate to user profile
- Click entity ID to navigate to entity (if applicable)
- "Details" button opens modal with formatted JSON metadata
- Date range picker updates results immediately
- Filters update results immediately
- Search input debounced (300ms)
- Pagination controls at bottom
- "Export to CSV" button (downloads filtered results)
- "Refresh" button to reload current view

### Data Requirements

- Fetch logs on page load using ApiActivityLogService.getActivityLogs()
- Use server-side pagination, filtering, and sorting
- Fetch user list for filter dropdown using ApiUserService.getUsers()
- Refresh data when filters change
- Cache user dropdown data for 5 minutes

### Business Rules

- Only Admin can access this page (use route guard)
- Show user-friendly action names (map "USER_CREATED" → "User Created")
- Color-code action badges:
  - CREATE actions: green
  - UPDATE actions: blue
  - DELETE actions: red
  - LOGIN/LOGOUT: gray
  - ERROR actions: orange
- Disable entity link if entityType/entityId not present
- Show "System" as user if userId is null (system-generated logs)

### Special Requirements

- Use virtual scrolling if results exceed 200 items
- Export respects current filters (max 10,000 rows)
- Add breadcrumb: Dashboard > Activity Logs
- Add route: /backoffice/activity-logs
- Add navigation menu item under "Backoffice" submenu with icon (nz-icon: file-text)

---

## Implementation Notes

The skills will automatically guide implementation with their checklists. This prompt focuses on WHAT to build (requirements, business rules, UI), not HOW to build it (implementation steps, patterns, file structure).

### Expected Outcome

**Backend:**

- DTOs in packages/types/
- Entity with indexes in data-access-layer
- ActivityLogDbService with efficient queries
- Controller with Swagger documentation
- Service and mapper
- Unit tests (controller, service, mapper, dbservice)
- Auto-generated Angular service via gen-api-client

**Frontend:**

- Feature structure in apps/web-ui/src/app/features/backoffice/activity-logs/
- activity-logs-list component with NG-ZORRO table
- activity-log-details modal component
- Filtering, search, and pagination
- Route in backoffice-routing.module.ts
- Navigation menu item in header.component.html

**Quality:**

- All tests passing
- Build successful
- Lint and format passing
- E2E tests (optional)

---

## Final Deliverables

After implementation is complete, provide a summary report showing:

### Test Results

Run `npm run test` and report:

- Total number of test suites passed/failed
- Total number of tests passed/failed
- Specific test files covered:
  - Backend: activity-log.controller.spec.ts, activity-log.service.spec.ts, activity-log.mapper.spec.ts, activity-log-db.service.spec.ts
  - Frontend: activity-logs-list.component.spec.ts, activity-log-details.component.spec.ts (if created)

### Code Coverage

Run `npm run test:coverage` and report:

- Overall coverage percentages (Statements, Branches, Functions, Lines)
- Coverage for each module:
  - packages/data-access-layer
  - apps/web-server
  - apps/web-ui
- Identify any files below the project's coverage threshold

### API Client Generation

- Confirm `npm run gen-api-client` was executed after backend implementation
- Verify ApiActivityLogService was generated in packages/api-client/src/api/features/activity-log/
- Confirm the service includes all endpoints: findAll(), findOne(), findByUser()

### Build Verification

- Confirm `npm run build` completes successfully
- Confirm `npm run lint` passes
- Confirm `npm run format:check` passes

**Example Report Format:**

```
✅ Implementation Complete

API Client: ✅ Generated (ApiActivityLogService with 3 endpoints)
Tests: 45 passed, 0 failed (8 test suites)
Coverage: 85.2% statements, 78.4% branches, 82.1% functions, 84.9% lines
Build: ✅ Success
Lint: ✅ Passed
Format: ✅ Passed
```
