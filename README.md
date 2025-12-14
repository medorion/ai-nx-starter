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
Use the backend-dev-guidelines skill and frontend-dev-guidelines skill.

Create a Team management feature.

## Backend: Team CRUD API

**Entity Fields:** id (UUID), name (required, 3-100 chars, unique), description (optional, max 500 chars), ownerId (User ref), memberIds (User refs array), createdAt, updatedAt

**API Endpoints:**
- GET /teams - List all teams
- GET /teams/:id - Single team with populated owner and members
- POST /teams - Create team (creator becomes owner)
- PUT /teams/:id - Update team
- DELETE /teams/:id - Delete team
- POST /teams/:id/members - Add member to team
- DELETE /teams/:id/members/:userId - Remove member from team

**Business Rules:**
- Only team owner can update/delete their team
- Admin can manage all teams
- Team owner can add/remove members
- Team name must be unique
- Owner is automatically added to members

## Frontend: Team List & Form

**UI:** NG-ZORRO table with columns (name, description, owner, member count, actions) | Create button | Edit/Delete buttons | Empty state

**Interactions:** Create → modal form | Edit → modal form (pre-filled) with members section | Delete → confirmation dialog | Add member → user picker | Remove member → confirmation

**Data:** Fetch with ApiTeamService on load | Refresh after create/update/delete | Show member avatars/names

**Routing:** /backoffice/teams | Menu item under "Backoffice"
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
- `prompts/example-activity-logs-feature.md` - Real-world full-stack feature example

**How it saves you tokens:**

- Traditional: Claude reads 50KB of docs for every request
- Skills: Claude loads only the 10KB backend guide when you say "CRUD"
- Result: Faster responses, lower costs, better context

## 📖 Learning to Use Claude Code with This Repo

1. **Start with CLAUDE.md** - Quick reference and critical rules
2. **Read the prompt guides** - Learn to write effective prompts:
   - `prompts/backend-prompt-guide.md` - Backend feature prompts
   - `prompts/frontend-prompt-guide.md` - Frontend UI prompts
   - `prompts/example-activity-logs-feature.md` - Complete full-stack example
3. **Review the skills** - Understand what patterns Claude will apply:
   - `.claude/skills/backend-dev-guidelines/SKILL.md`
   - `.claude/skills/frontend-dev-guidelines/SKILL.md`
4. **Try an example** - Use the Team feature (Quick Start) or Activity Logs example as templates
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
