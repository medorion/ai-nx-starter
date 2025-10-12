# AI-Nx-Starter

> **AI-Optimized Full-Stack Development** - Build production-ready applications 10x faster with AI assistance

An Nx monorepo starter designed from the ground up for AI-assisted development. Features auto-generated API clients, comprehensive prompt library, and proven workflows that maximize AI coding efficiency.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/YOUR_ORG/ai-nx-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/ai-nx-starter/actions/workflows/ci.yml)
[![Docker](https://github.com/YOUR_ORG/ai-nx-starter/actions/workflows/docker.yml/badge.svg)](https://github.com/YOUR_ORG/ai-nx-starter/actions/workflows/docker.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🤖 Why AI-Nx-Starter?

Traditional starter templates give you code. **AI-Nx-Starter gives you an AI multiplication system.**

| Traditional Development | With AI-Nx-Starter |
|------------------------|-------------------|
| Manual API client coding | **Auto-generated** from controllers |
| Hours writing boilerplate | **Minutes** with AI prompts |
| Inconsistent patterns | **Enforced** via .clinerules |
| Trial and error | **Proven** prompt templates |

**Real Impact:** Build a complete CRUD feature in 20-30 minutes vs 2-3 hours manually.

## ⚡ Quick Start (AI-Powered)

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_ORG/ai-nx-starter.git
cd ai-nx-starter
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# For local development with Docker, the defaults work fine
```

### 3. Start Database Services (Docker)

```bash
# Start PostgreSQL, MongoDB, and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Or use existing databases:** Update `.env` with your connection strings.

### 4. Tell Your AI Assistant

```
Read AI-DEVELOPMENT.md and familiarize yourself with the project structure.
Then read documents/dev-workflow.md to understand the development workflow.
```

### 5. Start Development

```bash
# Start all services
npm run start

# Frontend: http://localhost:8081
# Backend API: http://localhost:8081/api
```

### 6. Create Your First Feature with AI

Use this prompt:
```
Create a complete CRUD feature for Product following the workflow in documents/dev-workflow.md

Product fields:
- id (string, auto-generated)
- name (string, required)
- price (number, required)
- description (string, optional)

Follow the step-by-step process and run npm run build after each step.
```

See [prompts/create-crud-feature.md](./prompts/create-crud-feature.md) for the full template.

## 🎯 Key Features

### 🤖 AI-First Architecture

- **`.clinerules`** - Claude Code project configuration
- **`/prompts`** - 5 ready-to-use AI prompt templates
- **`AI-DEVELOPMENT.md`** - Comprehensive AI workflow guide
- **Auto-generated API clients** - Type-safe Angular services from NestJS controllers

### 🏗️ Production-Ready Stack

**Frontend:**
- Angular 19 + NG-ZORRO (Ant Design)
- RxJS + TypeScript
- Auto-generated HTTP clients

**Backend:**
- NestJS 11 + TypeORM
- PostgreSQL + MongoDB + Redis
- Pino structured logging

**DevOps:**
- Nx monorepo with caching
- Docker + Docker Compose
- ESLint + Prettier

### 📦 Smart Package Structure

```typescript
@ai-nx-starter/types          // Shared DTOs and types
@ai-nx-starter/api-client     // Auto-generated Angular services
@ai-nx-starter/backend-common // Shared backend utilities
@ai-nx-starter/data-access-layer // Database layer
```

## 🚀 AI Workflows

### Generate Complete CRUD Feature

**Time: 20-30 minutes** (vs 2-3 hours manually)

```
Use the prompt from prompts/create-crud-feature.md
Replace [ENTITY_NAME] and [FIELDS]
Let AI build backend + frontend + tests
```

### Add API Endpoint

**Time: 5-10 minutes** (vs 20-30 minutes manually)

```
Use the prompt from prompts/add-api-endpoint.md
AI generates controller method + service + auto-updates API client
```

### Fix Build Errors

**Time: 5-10 minutes** (vs 20-45 minutes manually)

```
Run: npm run build
Copy errors
Use prompts/fix-build-errors.md
AI analyzes and fixes systematically
```

See [AI-DEVELOPMENT.md](./AI-DEVELOPMENT.md) for complete AI workflows.

## 📁 Project Structure

```
ai-nx-starter/
├── apps/
│   ├── web-ui/              # Angular 19 frontend
│   └── web-server/          # NestJS 11 backend
├── packages/
│   ├── types/               # Shared TypeScript DTOs
│   ├── api-client/          # Auto-generated Angular services ⚡
│   ├── data-access-layer/   # TypeORM entities & services
│   └── backend-common/      # Shared backend utilities
├── prompts/                 # AI prompt library 🤖
│   ├── create-crud-feature.md
│   ├── add-api-endpoint.md
│   ├── create-ui-component.md
│   ├── generate-tests.md
│   └── fix-build-errors.md
├── documents/               # Technical documentation
├── .clinerules             # Claude Code configuration 🤖
├── AI-DEVELOPMENT.md       # AI workflow guide 🤖
└── CASE-STUDY.md          # Real-world metrics 📊
```

## 🔄 Development Workflow

### The Auto-Generation Loop

```
1. Create/modify NestJS controller
2. Run: npm run gen-api-client
3. Use generated Angular service
4. Build: npm run build
```

**What Gets Auto-Generated:**
- Type-safe Angular HTTP services
- Request/response types
- Path/query parameter handling
- Observable-based API calls

### Standard CRUD Flow

```bash
# 1. Create entity in data-access-layer
# 2. Create controller in web-server
# 3. Generate API client
npm run gen-api-client

# 4. Create UI components
# 5. Verify
npm run build
```

See [documents/dev-workflow.md](./documents/dev-workflow.md) for details.

## 🛠️ Commands

```bash
# Development
npm run start              # Run all services
npm run ui                 # Frontend only
npm run server             # Backend only

# Building
npm run build              # Development build
npm run build:prod         # Production build

# Code Quality
npm run lint               # Lint all projects
npm run format:fix         # Auto-format code
npm run test               # Run tests

# AI Workflows
npm run gen-api-client     # Generate Angular API services ⚡
```

## 🐳 Docker

```bash
# Build image
./build-docker.sh

# Run with compose
docker-compose up

# Access
# Frontend: http://localhost:3030
# API: http://localhost:3030/api
```

## 📚 Documentation

- **[AI-DEVELOPMENT.md](./AI-DEVELOPMENT.md)** - AI workflows and best practices
- **[CASE-STUDY.md](./CASE-STUDY.md)** - Real metrics and time savings
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute
- **[documents/](./documents)** - Technical guides

### AI Prompt Library

- [Create CRUD Feature](./prompts/create-crud-feature.md) - Complete backend + frontend
- [Add API Endpoint](./prompts/add-api-endpoint.md) - New controller methods
- [Create UI Component](./prompts/create-ui-component.md) - Angular components
- [Generate Tests](./prompts/generate-tests.md) - Unit tests
- [Fix Build Errors](./prompts/fix-build-errors.md) - Debug TypeScript

## 🎯 Use Cases

### Ideal For

✅ Rapid prototyping with AI assistance
✅ Learning AI-assisted development
✅ Full-stack TypeScript projects
✅ Teams adopting AI coding tools
✅ Building SaaS MVPs quickly

### Not Ideal For

❌ Non-TypeScript projects
❌ Microservices architecture (this is a monolith)
❌ Projects without AI coding assistants

## 🤝 Contributing

We welcome contributions! This project is designed to showcase AI-assisted development patterns.

**Ways to Contribute:**
- Share your AI prompts in `/prompts`
- Improve AI workflow documentation
- Add case studies with metrics
- Report bugs or suggest features

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📊 Proven Results

See [CASE-STUDY.md](./CASE-STUDY.md) for real-world metrics:

- ⏱️ CRUD features: 70% faster development
- 🎯 Code generation: 90%+ first-try success rate
- 🧪 Test coverage: 70%+ with AI-generated tests
- 🐛 Build errors: < 3 per feature on average

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features.

**Coming Soon:**
- GraphQL support
- Microservices template
- More AI prompt templates
- Video tutorials
- Performance benchmarks

## 🔧 Troubleshooting

### Common Issues

**"Cannot connect to database"**
```bash
# Check if Docker services are running
docker-compose ps

# Restart services
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs postgres
docker-compose logs mongodb
```

**"Module not found" errors**
```bash
# Clear cache and reinstall
rm -rf node_modules dist .nx
pnpm install
```

**"Port already in use"**
```bash
# Check what's using the port
lsof -i :3030  # or :8081

# Kill the process or change PORT in .env
```

**"Gen-api-client fails"**
```bash
# Ensure backend builds successfully first
npm run build

# Then run generator
npm run gen-api-client
```

**Tests fail with import errors**
```bash
# Install dependencies in test mode
pnpm install

# Run specific test
npx nx test web-server --testPathPattern=user.service
```

### Need More Help?

- Check [AI-DEVELOPMENT.md](./AI-DEVELOPMENT.md) for AI workflow issues
- Search [existing issues](https://github.com/YOUR_ORG/ai-nx-starter/issues)
- Ask in [Discussions](https://github.com/YOUR_ORG/ai-nx-starter/discussions)

## 💬 Support

- **Documentation:** Check [documents/](./documents) and [AI-DEVELOPMENT.md](./AI-DEVELOPMENT.md)
- **Issues:** [GitHub Issues](https://github.com/YOUR_ORG/ai-nx-starter/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_ORG/ai-nx-starter/discussions)

## 📄 License

MIT © [Your Organization]

See [LICENSE](./LICENSE) for details.

---

**Built with AI assistance using Claude, demonstrating the power of AI-optimized development workflows.**

⭐ Star this repo if you found it helpful!
