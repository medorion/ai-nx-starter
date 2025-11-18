# AI-Nx-Starter

[![CI](https://github.com/Medorion/ai-nx-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/Medorion/ai-nx-starter/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/Medorion/ai-nx-starter/actions/workflows/e2e.yml/badge.svg)](https://github.com/Medorion/ai-nx-starter/actions/workflows/e2e.yml)
[![codecov](https://codecov.io/gh/Medorion/ai-nx-starter/branch/main/graph/badge.svg)](https://codecov.io/gh/Medorion/ai-nx-starter)

**Full-stack TypeScript monorepo optimized for AI-assisted development.**

Angular 19 + NestJS 11 + MongoDB with strict patterns to build faster.

## What Makes This Different?

**Traditional starters give you code.** AI-Nx-Starter gives you an **AI multiplication system**:

- 📖 **Built-in AI rules** - Claude Code and Windsurf auto-apply patterns
- 🤖 **Auto-generated API clients** - Type-safe Angular services from NestJS controllers
- ⚡ **Strict conventions** - Clear patterns = faster AI development
- 🎯 **testing and ci as part of the flow** - comprehensive testing guidelines including coverage and e2e

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_ORG/ai-nx-starter.git
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
Then create a Product CRUD feature with these fields:
- name (string, required)
- price (number, required)
- description (string, optional)

Follow the workflow in prompts/create-crud-feature.md
```

**What happens:** AI creates DTOs, entities, services, controllers, tests, and UI.

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

**Good for:**

- Learning AI-assisted development
- Rapid prototyping and MVPs
- Personal projects
- Understanding monorepo architecture

**Not production-ready without additional work:**

- No security audit performed
- Development-only session storage
- No rate limiting
- Monolithic architecture (not microservices)
- Limited production deployment examples

See [SECURITY.md](./SECURITY.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) before production use.

## 🔧 Troubleshooting

**Cannot connect to database:**

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

**Built with AI assistance using Claude Code and Windsurf.**

⭐ Star this repo if AI-assisted development interests you!
