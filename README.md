# AI-Nx-Starter

[![CI](https://github.com/Medorion/ai-nx-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/Medorion/ai-nx-starter/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/Medorion/ai-nx-starter/actions/workflows/e2e.yml/badge.svg)](https://github.com/Medorion/ai-nx-starter/actions/workflows/e2e.yml)
[![codecov](https://codecov.io/gh/Medorion/ai-nx-starter/branch/main/graph/badge.svg)](https://codecov.io/gh/Medorion/ai-nx-starter)

**Full-stack TypeScript monorepo optimized for Claude Code development.**

Angular 19 + NestJS 11 + MongoDB with strict patterns to build faster with Claude.

## What Makes This Different?

**Traditional starters give you code.** AI-Nx-Starter gives you a **Claude Code multiplication system**:

- 🤖 **Claude Code Skills** - Context-rich guides that auto-activate based on keywords (CRUD, controller, component, etc.)
- ⚡ **Auto-generated API clients** - Type-safe Angular services generated from NestJS controllers
- 📋 **Prompt guides** - Learn how to write effective prompts that leverage the skills system
- 🎯 **Testing and CI built-in** - Comprehensive testing guidelines including coverage and e2e
- 💾 **Context-optimized** - Skills load only when needed, saving tokens and improving Claude's performance

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

### 3. Try Claude Code Development

**Open Claude Code and say:**

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

**What happens:** Claude Code creates DTOs, entities, services, controllers, tests, UI, documentation, e2e, etc.

**How it works:**

- The `backend-dev-guidelines` skill automatically activates when you mention "CRUD", "controller", "service"
- The `frontend-dev-guidelines` skill activates when you mention "component", "UI", "form", "table"
- Claude follows patterns from the skills to generate consistent, tested code

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
├── .claude/
│   └── skills/              # Claude Code skills - auto-load on keywords
├── prompts/                 # Prompt writing guides for users
└── CLAUDE.md                # Quick reference for Claude Code
```

## 🎯 Key Features

### Claude Code-First Development

- **Natural language works** - Describe what you need in plain English
- **Auto-applied standards** - Security, validation, Swagger docs, testing
- **Smart skills system** - Comprehensive guides auto-load when you mention keywords like "CRUD", "controller", "service", "component", "form"
- **Context-efficient** - Skills load only when needed, reducing token usage while providing deep expertise
- **Prompt guides** - Learn to write effective prompts in `prompts/backend-prompt-guide.md` and `prompts/frontend-prompt-guide.md`

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
npm run test:coverage # Run tests with coverage
npm run e2e           # Run e2e tests
npm run build         # Build all packages
npm run lint          # Check code quality
npm run format:fix    # Auto-format code
```

## 🤖 Claude Code Workflows

**Skills auto-activate on keywords:**

- Say "create a CRUD feature" → `backend-dev-guidelines` skill loads automatically
- Say "create a user list component" → `frontend-dev-guidelines` skill loads automatically
- Mention "controller", "service", "DTO" → Backend patterns applied instantly
- Mention "component", "form", "table" → Frontend patterns applied instantly
- No manual skill invocation needed - Claude detects context automatically

**Key files for Claude Code:**

- `CLAUDE.md` - Quick reference and critical rules (read this first!)
- `.claude/skills/backend-dev-guidelines/` - NestJS patterns and checklists
- `.claude/skills/frontend-dev-guidelines/` - Angular 19 patterns and checklists
- `prompts/backend-prompt-guide.md` - How to write effective backend prompts
- `prompts/frontend-prompt-guide.md` - How to write effective frontend prompts

**How it saves you tokens:**

- Traditional: Claude reads 50KB of docs for every request
- Skills: Claude loads only the 10KB backend guide when you say "CRUD"
- Result: Faster responses, lower costs, better context

## 📖 Learning to Use Claude Code with This Repo

1. **Start with CLAUDE.md** - Quick reference and critical rules
2. **Read the prompt guides** - Learn to write effective prompts:
   - `prompts/backend-prompt-guide.md` - Backend feature prompts
   - `prompts/frontend-prompt-guide.md` - Frontend UI prompts
3. **Review the skills** - Understand what patterns Claude will apply:
   - `.claude/skills/backend-dev-guidelines/SKILL.md`
   - `.claude/skills/frontend-dev-guidelines/SKILL.md`
4. **Try the example prompt** - Create the Team feature from Quick Start section
5. **Iterate** - The more you use it, the better your prompts will get

**Pro tip:** Keep prompts focused on WHAT you want (requirements, business rules), not HOW to build it (implementation details). The skills handle the HOW.

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Ways to contribute:**

- Share prompts that worked well with Claude Code
- Improve skills and prompt guides
- Add test coverage
- Report bugs or suggest features

## 📄 License

MIT © Medorion

See [LICENSE](./LICENSE) for details.

---

**Built with Claude Code using the skills system defined in this repo.**

⭐ Star this repo if Claude Code-assisted development interests you!
