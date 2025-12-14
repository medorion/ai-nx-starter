# Changelog

All notable changes to AI-Nx-Starter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.0] - 2025-12-14

### Added

- **Activity Logs Feature** - Complete full-stack audit logging system for tracking user actions and system events
  - **Backend Implementation**
    - DTOs: `ActivityLogDto`, `QueryActivityLogsDto` with pagination, filtering, and sorting
    - Database: MongoDB entity with optimized indexes on userId, action, entityType, timestamp
    - DbService: `ActivityLogDbService` with findAll, findById, findByUserId, create, count methods
    - API: 3 GET endpoints (list, single, user-specific) with Admin-only authorization
    - Service: `ActivityLogService` with user population using Map-based batch fetching
    - Mapper: `ActivityLogMapper` for entity-to-DTO transformations
    - Decorators: `@LogActivity()` for method-level automatic logging
    - Interceptors: `ActivityLoggingInterceptor` for HTTP request/response logging
    - Fire-and-forget async logging with setImmediate (non-blocking)
    - Tests: 97% coverage in data-access-layer, 69% in web-server
  - **Frontend Implementation**
    - Components: `ActivityLogsListComponent` with NG-ZORRO table, filters, pagination
    - Components: `ActivityLogDetailsComponent` modal with metadata viewer
    - Service: `ActivityLogsService` with BehaviorSubject state management
    - Features: Date range filtering (7-day default), action/entity type multi-select
    - Features: CSV export (max 10k rows), action badge color coding
    - Performance: OnPush change detection, trackBy functions, server-side pagination
    - Routing: `/backoffice/activity-logs` route with lazy loading
    - Navigation: Added "Activity Logs" menu item under Backoffice submenu
    - Tests: Comprehensive unit tests for components and services

- **Query Parameters Documentation** - Critical documentation in backend-dev-guidelines skill
  - New section in `controllers-guide.md` explaining API client generator constraint
  - Comprehensive guide on why `@Query(ValidationPipe)` with DTOs doesn't work
  - Solution pattern: Individual `@Query()` decorators with manual DTO construction
  - Real-world example from Activity Logs controller with 9 query parameters
  - Key patterns: ParseIntPipe usage, @ApiQuery documentation, date handling
  - Explanation of API client generator internals and limitations

### Changed

- **Controller Pattern** - Updated Activity Log controller to use individual query parameters
  - Refactored from `@Query(ValidationPipe) query: QueryActivityLogsDto` pattern
  - Now uses individual `@Query('paramName')` decorators for each parameter
  - Manually constructs DTO inside controller method
  - Ensures API client generator creates proper HTTP query parameters

- **API Client Generation** - Regenerated with individual query parameter support
  - `ApiActivityLogService.findAll()` now accepts 9 individual parameters
  - Generates proper query strings: `?page=1&pageSize=50&userId=abc&...`
  - Fixed `[object Object]` serialization issue

### Fixed

- **API Client Query Serialization** - Fixed 400 Bad Request errors
  - Root cause: API client was serializing DTO as `?ValidationPipe=[object Object]`
  - Solution: Individual `@Query()` decorators generate proper query parameters
  - Updated frontend service to pass individual parameters instead of DTO object

- **TypeScript Strict Mode** - Fixed template errors with optional user objects
  - Added optional chaining for user properties: `log.user.firstName?.[0]`
  - Prevents "possibly undefined" errors in activity log templates

- **Component Configuration** - Fixed standalone component issues
  - Added `standalone: false` to ActivityLogsListComponent and ActivityLogDetailsComponent
  - Aligns with project's NgModule pattern (not Angular 19 standalone default)

- **Frontend Tests** - Updated test assertions for new API signature
  - Changed from DTO object expectations to individual parameter assertions
  - All 6 ActivityLogsService tests passing

### Documentation

- **Example Prompts** - Added `prompts/example-activity-logs-feature.md`
  - Complete example of full-stack feature implementation
  - Demonstrates proper prompt structure for complex features
  - Shows integration of backend and frontend with testing requirements

- **Backend Skill** - Enhanced `backend-dev-guidelines/resources/controllers-guide.md`
  - 180+ lines of new documentation on query parameters
  - Prevents future API client generation errors
  - Includes problem explanation, solution pattern, and real examples

## [1.5.0] - 2025-11-27

### Added

- **Complete CRUD Workflow Template** - Enhanced `prompts/create-crud-feature.md` to 16-step comprehensive workflow
  - Added build verification after UI creation (Step 11)
  - Added UI component testing requirements (Step 12)
  - Added UI coverage verification (Step 13)
  - Added format fix step (Step 14)
  - Added final verification step (Step 15: build + lint + manual test + Swagger)
  - Added optional E2E testing guidance (Step 16)
  - Consolidated backend testing into single step with explicit coverage requirements
  - Made coverage thresholds explicit: 80% statements/lines, 60% branches/functions

- **UI Navigation Guidance** - Added "Adding New UI Features" section to `documents/web-ui-architecture.md`
  - Ensures routing and navigation are always added for new features
  - Provides clear guidance on where to add menu items
  - Instructs AI to ask for clarification when location is ambiguous

- **Coverage Testing Documentation** - Enhanced `\.claude/instructions.md` with comprehensive testing guidance
  - How to run coverage for all packages vs. specific packages
  - Understanding coverage failure messages and exit codes
  - Clear instructions on what to do when coverage fails
  - Package-specific commands for faster feedback

- **Team Example Improvements** - Made Team feature example more explicit and realistic
  - Added member management functionality (add/remove users)
  - Specified "Manage Members" button in table rows
  - Detailed team-members modal with dropdown and remove buttons
  - Explicit API endpoint calls for member operations

### Changed

- **Documentation Simplification** - Reduced redundancy and improved clarity
  - `.claude/instructions.md`: 249 → 149 lines (40% reduction)
    - Removed redundant Swagger/Testing details already in `/documents/`
    - Kept unique content: file checklist, monorepo structure, dependencies
  - `.claude/README.md`: 101 → 59 lines (42% reduction)
    - Removed verbose examples and migration history
    - Focused on essential how-to-use information

- **CRUD Template Cross-References** - Added explicit reference to `prompts/create-ui-component.md` in step 10
  - Ensures AI applies detailed UI guidance during CRUD workflows
  - Better integration between templates

- **Coverage Commands** - Updated to use package-specific commands for clearer output
  - Backend: `npx nx test web-server --coverage` instead of global `npm run test:coverage`
  - Frontend: `npx nx test web-ui --coverage`
  - Provides faster feedback and more focused results

### Removed

- **Windsurf Support** - Removed all Windsurf references and configuration
  - Deleted 7 `.windsurfrules` files (root + 6 package directories)
  - Deleted `AI-TOOLS.md` (245 lines comparing AI tools)
  - Updated README.md, CONTRIBUTING.md, and documentation to mention only Claude Code
  - Focusing on Claude Code provides better maintained, hierarchical configuration

- **`ROADMAP.md`** - Removed placeholder roadmap file
  - Project is in active development; roadmap will be added when ready
  - Removed references from README.md and DEPLOYMENT.md

### Fixed

- **Missing UI Testing** - AI agents were skipping UI component tests and builds
  - Template now explicitly requires UI tests with coverage verification
  - Build step prevents proceeding with broken code

- **Missing Navigation** - AI agents were creating UI features without routing/navigation access
  - Architecture documentation now mandates routing and menu items
  - AI asks for clarification when location is ambiguous

- **Coverage Confusion** - AI agents struggled to run and interpret coverage results
  - Added clear commands with expected output examples
  - Explicit guidance on what coverage failure looks like
  - Instructions on how to fix coverage issues

## [1.4.1] - 2025-11-12

### Changed

- **Coverage Thresholds Increased** - Raised from 70% to 80% for statements/lines
  - Updated `jest.preset.js` global thresholds
  - Updated `.codecov.yml` project target to 80%
  - Updated CI workflow error messages
  - All packages now meet new threshold:
    - web-ui: 81.31% statements
    - web-server: 81.25% statements
    - backend-common: 85.88% statements
    - data-access-layer: 98.36% statements

### Added

- **Comprehensive Testing Documentation System**
  - `documents/code-coverage-exclusions.md` - Decision framework for what to test vs. exclude
    - 6-step decision process with visual flowchart
    - Red flags for what should NEVER be excluded
    - Best practices for documentation and refactoring
    - Current exclusions by package with reasoning
  - `documents/ai-testing-guidelines.md` - How AI assistants should approach testing
    - Step-by-step workflow for creating tests
    - Decision matrix for common code types
    - Common pitfalls with examples from project history
    - Proactive test generation policy (when AI should write tests automatically)
  - `documents/testing-context-overview.md` - Meta-documentation explaining the system
    - How AI uses the documentation
    - Real examples from conversation history
    - Benefits for AI, developers, and codebase
- **AI Context Updates** - Testing & Coverage section in `CLAUDE.md`
  - Reference to testing documentation with clear workflow
  - Key principles: test business logic, exclude infrastructure
  - Updated "Critical Rules" to enforce `npm run format:fix` immediately after file changes
- **New Test Files**
  - `apps/web-server/src/app/health/health.controller.spec.ts` - Health endpoint tests
  - `apps/web-ui/src/app/core/services/theme.service.spec.ts` - Theme service tests
- **Updated Test Configurations**
  - `apps/web-server/jest.config.ts` - Added health controller exclusion removal
  - `apps/web-ui/jest.config.ts` - Documented current exclusions
  - `packages/backend-common/jest.config.ts` - Updated exclusions
- **Updated Prompt Templates**
  - `prompts/generate-tests.md` - Added "Before You Start" section referencing comprehensive guidelines

### Fixed

- **Formatting Enforcement** - Added explicit rule to run `npm run format:fix` after any file creation/modification
  - Prevents Prettier warnings in future development
  - Updated CLAUDE.md critical rules

## [1.4.0] - 2025-11-12

### Added

- **Interactive API Documentation** - Complete Swagger/OpenAPI 3.0 implementation
  - Swagger UI accessible at `http://localhost:3030/api/docs`
  - OpenAPI JSON specification at `/api/docs-json`
  - 21 endpoints fully documented across 6 controllers:
    - `AuthController`: login, ui-app-context, logout
    - `UserController`: CRUD operations + search
    - `ExampleController`: CRUD with complex parameter handling
    - `SyncEventsController`: SSE streaming endpoints
    - `ExceptionsController`: Custom exception demonstrations
    - `HealthController`: Health check endpoint
  - All endpoints include:
    - @ApiOperation with summary and description
    - @ApiResponse for all status codes (success and error cases)
    - @ApiParam for path parameters with examples
    - @ApiQuery for query parameters with examples
    - @ApiBody for request bodies (inline schemas or DTO references)
    - @ApiBearerAuth for authenticated endpoints
- **API Reference Documentation** - `documents/api-reference.md` with 850+ lines
  - Authentication guide with demo credentials
  - Complete endpoint documentation with request/response examples
  - SSE usage examples with JavaScript code
  - Data model schemas (DTOs, enums)
  - Error response codes (standard HTTP + custom 455-459)
  - Rate limiting, CORS, and session management notes
- **AI Prompt Template** - `prompts/document-api-endpoint.md`
  - Three detailed examples (GET, POST with body, complex PATCH)
  - Swagger decorator quick reference table
  - Common HTTP status codes table
  - Testing and verification checklist
- **Documentation Resources Integration** - All AI assistants now reference `/prompts/` and `/documents/`
  - Added "Documentation Resources" section to `CLAUDE.md`
  - Lists all 8 prompt templates with their purposes
  - Lists all 8 technical reference documents
  - Updated CRUD workflow with references to specific prompt files
  - Added 📖 emoji indicators linking to relevant prompts
- **AI Context Updates** - Comprehensive Swagger and testing requirements
  - Updated `.claude/instructions.md` with:
    - Documentation Resources section (how to use `/prompts/` and `/documents/`)
    - API Documentation section (Swagger requirements, DTOs rule, verification steps)
    - Unit Testing section (Jest, >80% coverage target, test templates, running tests)
  - Updated `prompts/add-api-endpoint.md` with Swagger and testing requirements
  - Updated `prompts/create-crud-feature.md` with comprehensive workflow
- **Dependencies**
  - `@nestjs/swagger@^11.2.1` - NestJS integration for OpenAPI/Swagger
  - `swagger-ui-express@^5.0.1` - Interactive API documentation UI

### Changed

- **Architectural Decision**: DTOs remain framework-agnostic
  - DTOs in `packages/types` use only `class-validator` decorators
  - Swagger decorators (`@ApiProperty`) NEVER added to DTOs
  - All Swagger documentation lives in controllers only
  - Maintains clean separation between shared types and API documentation
  - Frontend builds successfully without server-only dependencies
- **Controller Pattern** - All controllers now follow documented Swagger pattern
  - Controllers serve as both API implementation and documentation source
  - `apps/web-server/src/app/features/user/user.controller.ts` established as reference example
- **README.md** - Updated with API documentation links
  - Added API Documentation section under "Access"
  - Link to `documents/api-reference.md`
  - Removed "No API documentation" from limitations section
- **ROADMAP.md** - Updated to reflect completed API documentation

### Fixed

- Frontend build issues when DTOs contained `@ApiProperty` decorators
  - Initially attempted conditional decorators (failed)
  - Solution: Keep Swagger decorators exclusively in controllers
  - Frontend now builds cleanly without bundling server-only dependencies

## [1.3.0] - 2025-11-11

### Added

- **Phase 2: Core CRUD Test Coverage** - 354 comprehensive tests across backend and frontend
  - **Backend Tests (101 tests)**
    - `example.controller.spec.ts`: 23 tests for NestJS controller CRUD endpoints
    - `example.service.spec.ts`: 28 tests for in-memory service with auto-incrementing IDs
    - `todo-item.db-service.spec.ts`: 50 tests for MongoDB repository with nested SubItems
  - **Frontend Tests (253 tests)**
    - `users.service.spec.ts`: 23 tests for API client wrapper with loading state management
    - `user-form.component.spec.ts`: 33 tests for reactive form component (create/edit modes)
    - `ui-app-context.service.spec.ts`: 35 tests for authentication context and user state
    - `event-bus.service.spec.ts`: 71 tests for typed event publishing across app domains
    - `pub-sub.service.spec.ts`: 31 tests for pub/sub with replay, filtering, debouncing
    - `role.guard.spec.ts`: 23 tests for route guard role-based access
    - `global-error-handler.spec.ts`: 37 tests for global error handling (all error types)

### Fixed

- Fixed 8 ESLint errors in `pub-sub.service.spec.ts`
  - Changed `let` to `const` for immutable objects (prefer-const)
  - Replaced empty arrow functions with `jest.fn()` (no-empty-function)
- Fixed type safety issues in event payloads (added missing required fields)
- Fixed RxJS timing issues using `fakeAsync`/`tick` for deterministic tests
- Fixed UIAppContextDto structure (removed non-existent properties)
- Fixed Angular form validator keys (minlength vs minLength)

### Changed

- Total test count increased from 117 to 321 tests (174% increase)
- All tests passing with lint checks successful

## [1.2.2] - 2025-11-11

### Fixed

- **macOS CI Failure** - Fixed "Failed to process project graph" error on GitHub Actions macOS runners
  - Root cause: @swc/core 1.13.21 has a platform-specific bug affecting macOS CI environments
  - Solution: Downgraded @swc/core from 1.13.21 to 1.13.5 (last working version)
  - The issue was specific to GitHub Actions macOS runners; Ubuntu, Windows, and local macOS all worked fine
- Fixed pnpm-lock.yaml formatting to pass Prettier checks

## [1.2.1] - 2025-11-11

### Changed

- Updated pnpm-lock.yaml formatting (dependency lockfile maintenance)

## [1.2.0] - 2025-11-11

### Fixed

- **E2E Test Workflow** - Complete overhaul to make E2E tests pass in CI
  - Fixed environment variables (MONGODB_URI → MONGO_URI, added all required vars)
  - Changed build process to use `npm run build:prod` (builds all workspace packages)
  - Use `npm run server` and `npm run ui` instead of running node/http-server directly
  - Corrected health endpoint path from `/ai-nx-starter/rest/api/v2/health` to `/health`
  - Fixed artifact upload paths and conditions (only on failure)
  - Result: All 6 E2E tests now pass successfully in CI
- Fixed package name references in users.md documentation (@monorepo-kit → @ai-nx-starter)
- Updated pnpm-lock.yaml with latest dependencies

### Changed

- E2E workflow now properly starts backend and frontend using nx serve
- Artifact uploads only occur on test failures to eliminate warnings
- Improved E2E workflow debugging with logs for backend/frontend startup

## [1.1.0] - 2025-11-11

### Added

- **SECURITY.md** - Comprehensive security policy and vulnerability reporting process
  - Supported versions table
  - Detailed vulnerability reporting guidelines
  - Security best practices for users (environment variables, database, sessions, API, Docker)
  - Known security considerations with current implementation notes
  - Recommended security headers for production
  - Audit logging recommendations
  - Third-party security dependency guidance
  - Compliance considerations
- **CHANGELOG.md** - Version history and change tracking
  - Follows Keep a Changelog format
  - Semantic versioning strategy
  - Historical documentation of all changes from v0.9.0 to v1.0.0
- **DEPLOYMENT.md** - Production deployment guide
  - Prerequisites checklist
  - Environment configuration guide
  - Docker Compose production setup with Nginx reverse proxy
  - Kubernetes deployment examples (namespace, configmap, secrets, deployments, services, ingress)
  - Cloud platform deployment guides (AWS, GCP, Azure)
  - Database production setup and migration strategy
  - Security checklist (25+ items)
  - Monitoring and observability recommendations (APM, logging, metrics, alerting)
  - Troubleshooting common issues
  - Backup and disaster recovery procedures
  - Scaling strategies (vertical and horizontal)

### Changed

- **README.md** - Improved accuracy and transparency
  - Removed exaggerated claim "10x faster" → "Accelerate full-stack development"
  - Added disclaimer about variable results based on experience and task complexity
  - Updated "Real Impact" → "Observed Impact" with realistic time estimates (40-60min vs 2-3 hours)
  - Changed "Proven Results" → "Development Observations" with proper context
  - Added comprehensive **"Current Limitations"** section documenting:
    - Testing gaps (~15% coverage, tests not in CI)
    - Security concerns (no audit, dev-only config, no rate limiting)
    - Documentation limitations (no API docs, no migration guide)
    - Architecture constraints (monolithic, no i18n, no a11y testing)
    - Developer experience issues (8 ESLint warnings, no commit hooks)
    - Project maturity assessment (v1.0.0 vs actual state)
  - Clear guidance on what project is ready for vs. what it's not ready for
  - Links to new SECURITY.md, CHANGELOG.md, and DEPLOYMENT.md files

## [1.0.0] - 2025-11-11

### Added

- E2E testing infrastructure with Playwright
- Cross-platform CI workflow with GitHub Actions
  - Runs on Ubuntu, macOS, and Windows
  - Tests Node.js 18, 20, and 22
  - API client validation in CI
- .gitattributes to enforce LF line endings across platforms
- Comprehensive user CRUD tests (controller, service, mapper, db-service)
- Basic users list component test
- CodeClimate integration

### Changed

- Fixed API client generator for Windows cross-platform compatibility
- Fixed MongoDB ObjectId handling in user service
- Improved development start script workflow
- Fixed UserDbService tests after ObjectId refactoring
- Moved Settings to root level for better UX
- Moved Welcome page to home route
- Theme persistence improvements
- Cleaner breadcrumb navigation (removed redundant 'Home')

### Fixed

- ESLint errors and warnings
- Prettier configuration and formatting
- Test failures related to Node.js 19+ compatibility
- Build configuration issues
- pnpm version compatibility in CI

### Removed

- Codecov badge from README (service not yet configured)

## [0.9.0] - 2025-11-05 (Pre-release)

### Added

- Initial monorepo structure with Nx
- Angular 19 frontend with NG-ZORRO UI components
- NestJS 11 backend with auto-generated API client
- TypeORM-based data access layer
- MongoDB integration
- Docker and Docker Compose setup
- User authentication with session management
- User CRUD operations (example feature)
- Example todo-item feature
- Sync events system for real-time updates
- Auto-generated type-safe API client
- Comprehensive AI development documentation structure
- CLAUDE.md for project rules and quick reference
- `/prompts/` directory with step-by-step task templates
- `/documents/` directory with architecture and AI context

### Infrastructure

- Nx monorepo configuration
- ESLint and Prettier setup
- TypeScript strict mode
- Git hooks configuration
- Docker multi-container setup

## Categories Reference

### Added

For new features.

### Changed

For changes in existing functionality.

### Deprecated

For soon-to-be removed features.

### Removed

For now removed features.

### Fixed

For any bug fixes.

### Security

For vulnerability fixes and security improvements.

---

## Versioning Strategy

- **Major (X.0.0)**: Breaking changes, major feature additions
- **Minor (1.X.0)**: New features, non-breaking changes
- **Patch (1.0.X)**: Bug fixes, documentation updates

## How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting changes and updating this changelog.

---

**Note**: Versions prior to 1.0.0 are considered pre-release and may not follow strict semantic versioning.
