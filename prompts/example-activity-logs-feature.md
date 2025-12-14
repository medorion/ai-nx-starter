# Activity Logs Feature - Full Stack Example

**⚠️ If using this file in Claude Code:** Start with `Use the backend-dev-guidelines skill and frontend-dev-guidelines skill to implement this feature.`

Complete end-to-end example for requesting a full-stack feature with proper backend and frontend requirements.

---

## Backend: Activity Logs API

Read-only API tracking user actions across the system.

**Entity Fields:** id (UUID), userId (User ref), action (e.g., "USER_CREATED"), entityType (optional), entityId (optional), metadata (JSON), ipAddress, userAgent, timestamp (indexed)

**API Endpoints:**

- GET /activity-logs - List with pagination, filtering, sorting (query params: page, pageSize, userId, action, entityType, startDate, endDate, sortBy, sortOrder)
- GET /activity-logs/:id - Single log with populated user details
- GET /activity-logs/user/:userId - User-specific logs (paginated)

**Note:** No create/update/delete endpoints - logs created automatically by the system.

**Business Rules:**

- Only Admin can view logs
- Logs immutable (no updates/deletes)
- Pagination: default 50/page, max 100
- Date range filtering required (default: last 30 days)
- Return populated user info (name, email)
- Sort by timestamp DESC by default

**Database:** Indexes on userId, action, entityType, timestamp. Efficient date range queries. Consider retention policy (e.g., auto-delete >1 year).

**Automatic Logging (CRITICAL):**

Implement @LogActivity decorator:
`@LogActivity(action, entityType?)` for specific events, extracts entityId from response

- Requirements: Async (no blocking), queue support (Bull/Redis), auto-populate metadata, error handling (don't break app), unit tests, coverage ≥80%
- After backend: Run `npm run gen-api-client`

---

## Frontend: Activity Logs Dashboard

Admin dashboard to view and filter system activity.

**UI:** NG-ZORRO table with columns (timestamp, user w/avatar, action badge, entity link, IP, details button) | Date range picker (default: 7 days) | Filters (action multi-select, entity type multi-select, user searchable) | Search input | Loading/empty states | Server-side pagination (50/page)

**Interactions:** Click row → expand details | Click user → profile | Click entity → navigate | Details button → JSON modal | Filters/date range → immediate update | Search → debounced 300ms | Export to CSV | Refresh button

**Data:** Fetch with ApiActivityLogService on load | Server-side pagination/filtering/sorting | Refresh on filter change

**Business Rules:** Admin-only (route guard) | User-friendly action names | Color-coded badges (CREATE=green, UPDATE=blue, DELETE=red, LOGIN/LOGOUT=gray, ERROR=orange) | Show "System" if userId null

**Routing:** /backoffice/activity-logs | Breadcrumb: Dashboard > Activity Logs | Menu item under "Backoffice" (icon: file-text)

**Performance:** Virtual scrolling if >200 items | Export max 10k rows

---

## Deliverables & Verification

**Backend:** DTOs (types/), entity w/indexes (data-access-layer/), DbService, controller (Swagger), service, mapper, interceptor/decorator, unit tests (controller, service, mapper, dbservice, interceptor, decorator), coverage ≥80%, gen-api-client

**Frontend:** Feature structure (apps/web-ui/.../activity-logs/), list component, details modal, filters/search/pagination, routing, navigation, unit tests, coverage ≥80%

**Final Report:**

```
✅ Implementation Complete

Automatic Logging: ✅ [Interceptor/Decorator] tested (sample endpoint → DB entry created)
API Client: ✅ ApiActivityLogService (findAll, findOne, findByUser)
Tests: [X] passed, 0 failed ([Y] suites) - Backend: ✅ | Frontend: ✅
Coverage: [X]% statements, [Y]% branches, [Z]% functions, [W]% lines
  - data-access-layer: [X]% | web-server: [Y]% | web-ui: [Z]%
Build: ✅ | Lint: ✅ | Format: ✅
```
