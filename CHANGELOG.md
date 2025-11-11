# Changelog

All notable changes to AI-Nx-Starter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Comprehensive AI development prompts and documentation
- CLAUDE.md for AI-assisted development
- AI-DEVELOPMENT.md with workflow guides

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
