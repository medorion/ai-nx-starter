# AI-Nx-Starter

[![CI](https://github.com/Medorion/ai-nx-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/Medorion/ai-nx-starter/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/Medorion/ai-nx-starter/actions/workflows/e2e.yml/badge.svg)](https://github.com/Medorion/ai-nx-starter/actions/workflows/e2e.yml)
[![codecov](https://codecov.io/gh/Medorion/ai-nx-starter/branch/main/graph/badge.svg)](https://codecov.io/gh/Medorion/ai-nx-starter)

**Full-stack TypeScript monorepo optimized for AI-assisted development.**

Angular 19 + NestJS 11 + MongoDB with strict patterns to build faster.

## What Makes This Different?

**Traditional starters give you code.** AI-Nx-Starter gives you an **AI multiplication system**:

- 📖 **Built-in AI rules** - Claude Code auto-applies patterns
- 🤖 **Auto-generated API clients** - Type-safe Angular services from NestJS controllers
- ⚡ **Strict conventions** - Clear patterns = faster AI development
- 🎯 **Testing and ci as part of the flow** - comprehensive testing guidelines including coverage and e2e

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/medorion/ai-nx-starter.git
cd ai-nx-starter
pnpm install
```

### 2. Start Development (Docker - Recommended)

```bash
# Start MongoDB, Redis, Backend, and Frontend
docker-compose up -d

# Access:
# Frontend: http://localhost
# Backend API: http://localhost:3030/ai-nx-starter/rest/api/v2
# Swagger UI: http://localhost:3030/api/docs
```

**Or without Docker:**

```bash
cp .env.example .env
# Edit .env with your MongoDB and Redis URLs (or use provided dockers)
npm run start
```

### 3. Try AI-Assisted Development

**Tell your AI agent:**

```
Read CLAUDE.md for project rules.

  Create a Team management feature with the following specifications:

  Entity Fields:
  - id: string (auto-generated UUID)
  - name: string (required, 3-100 chars, unique)
  - description: string (optional, max 500 chars)
  - ownerId: string (required, reference to User)
  - memberIds: string[] (array of User IDs)
  - createdAt: Date (auto-generated)
  - updatedAt: Date (auto-updated)

  Requirements:
  1. Create TeamDto, CreateTeamDto, UpdateTeamDto in packages/types/src/dto/features/teams/
  2. Create Team entity in packages/data-access-layer/src/features/team/entities/team.entity.ts
  3. Create TeamDbService in packages/data-access-layer/src/features/team/services/team.db-service.ts
  4. Create TeamController in apps/web-server/src/app/features/team/team.controller.ts
     - **REQUIRED:** Add Swagger decorators to ALL endpoints (@ApiOperation, @ApiResponse, @ApiBearerAuth)
     - Include endpoints:
       * GET /teams - List all teams
       * GET /teams/:id - Get single team with populated owner and members
       * POST /teams - Create new team (creator becomes owner)
       * PUT /teams/:id - Update team details
       * DELETE /teams/:id - Delete team
       * POST /teams/:id/members - Add user to team
       * DELETE /teams/:id/members/:userId - Remove user from team
  5. Create TeamService in apps/web-server/src/app/features/team/team.service.ts
  6. Create TeamMapper in apps/web-server/src/app/features/team/team.mapper.ts
  7. **REQUIRED:** Write unit tests for controller, service, and mapper (*.spec.ts files)
  8. Run: npm run test - Ensure all tests pass
  9. Run: npx nx test web-server --coverage
  10. Run: npm run gen-api-client
  11. Create UI in apps/web-ui/src/app/features/backoffice/teams/
      - teams-list component:
        * NG-ZORRO table showing teams with owner and member count
        * "Manage Members" button in each row that opens team-members modal
      - team-form component (create/edit modal for team name/description)
      - team-members component (modal for managing team members):
        * Display current team members list
        * Dropdown to select and add users to team (calls POST /teams/:id/members)
        * Remove button for each member (calls DELETE /teams/:id/members/:userId)
        * Show team owner (cannot be removed)
  12. Run: npm run build - Fix any build errors
  13. **REQUIRED:** Write unit tests for UI components (*.spec.ts files)
  14. Run: npx nx test web-ui --coverage
  15. Run: npm run format:fix
  16. Final verification: build + lint + manual test
  17. (Optional) Write E2E tests for team workflows
```

**What happens:** AI creates DTOs, entities, services, controllers, tests, UI, documentation, e2e, etc.

## 📁 Project Structure

```
ai-nx-starter/
├── apps/
│   ├── web-ui/              # Angular 19 frontend
│   └── web-server/          # NestJS 11 backend
├── packages/
│   ├── types/               # Shared DTOs
│   ├── api-client/          # Auto-generated Angular services ⚡
│   ├── data-access-layer/   # TypeORM entities & DB services
│   └── backend-common/      # Shared backend utilities
├── documents/               # AI context (architecture, standards, guidelines)
├── prompts/                 # Step-by-step task templates
└── CLAUDE.md               # Quick reference for AI agents
```

## 🎯 Key Features

### AI-First Development

- **Natural language works** - Just describe what you need
- **Auto-applied standards** - Security, validation, Swagger docs
- **Context-aware** - AI reads `/documents/` for patterns
- **Task templates** - `/prompts/` for complex workflows

### Production-Ready Stack

**Frontend:**

- Angular 19 + NG-ZORRO (Ant Design)
- Auto-generated type-safe API clients
- RxJS state management

**Backend:**

- NestJS 11 + TypeORM
- MongoDB + Redis
- Swagger/OpenAPI documentation
- Pino structured logging

**DevOps:**

- Nx monorepo with caching
- Docker + Docker Compose
- 80% test coverage enforced
- ESLint + Prettier

## 💻 Common Commands

```bash
# Development
npm run start  # All services
npm run ui     # Frontend only
npm run server # Backend only

# After backend changes
npm run gen-api-client # Generate Angular API services

# Quality
npm run test          # Run all tests
npm run test:coverage # Run all tests
npm run e2e           # Run e2e tests
npm run build         # Build all packages
npm run lint          # Check code quality
npm run format:fix    # Auto-format code
```

## 🤖 AI Workflows

**Complex workflows use templates:**

- Complete CRUD: `prompts/create-crud-feature.md`
- UI Components: `prompts/create-ui-component.md`

**Key files for AI:**

- `CLAUDE.md` - Quick reference and critical rules
- `documents/` - Architecture patterns (auto-applied)
- `prompts/` - Step-by-step workflows

## ⚠️ Current Limitations

**Not production-ready without additional work:**

- No security audit performed
- Development-only session storage
- No rate limiting
- Monolithic architecture (not microservices)
- Limited production deployment examples

See [SECURITY.md](./SECURITY.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) before production use.

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Ways to contribute:**

- Share AI prompts that worked well
- Improve documentation
- Add test coverage
- Report bugs or suggest features

## 📄 License

MIT © [Your Organization]

See [LICENSE](./LICENSE) for details.

---

**Built with AI assistance using Claude Code.**

⭐ Star this repo if AI-assisted development interests you!
