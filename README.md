# AI-Nx-Starter

[![CI](https://github.com/Medorion/ai-nx-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/Medorion/ai-nx-starter/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/Medorion/ai-nx-starter/actions/workflows/e2e.yml/badge.svg)](https://github.com/Medorion/ai-nx-starter/actions/workflows/e2e.yml)
[![codecov](https://codecov.io/gh/Medorion/ai-nx-starter/branch/main/graph/badge.svg)](https://codecov.io/gh/Medorion/ai-nx-starter)

> **AI-Optimized Full-Stack Development** - Accelerate full-stack development with AI assistance

> 🤖 **AI-First Development**: This project is optimized for AI-assisted development with Claude Code and Windsurf. Built-in rules and patterns enable rapid feature development with minimal manual coding.

> ⚠️ **Disclaimer**: Development speed improvements vary significantly based on developer experience, task complexity, and familiarity with the stack. See [Current Limitations](#-current-limitations) below.

**Clear And Well Defined Structure**:
This project provides strict rules and patterns for the development of full-stack applications with Angular frontend and NestJS backend.
This makes it optimized for AI assisted development.

**UI**:

- Exept from some usecases, UI is generated automatically by AI and strictly uses ng-zorro components in order to avoid "spagetti code" in the codebase.
- Under core folder we have predefined decorators, services and components that will simplify the development process and AI is instucted to use them. i.e Logging , Events, PubSub, etc.
- Auto generated apiClient for angular frontend is available in packages/api-client

**Backend**:

- Backend is built with NestJS and provides strict rules and patterns for the development of backend.
- Well defined data access leayer with single responsibility principle. i.e Only DbServices are allowed to access database.

**Packages**:

- Types and DTO trough packages/types, whgich is used both on server and client side.
- Shared entities through packages/data-access-layer.
- Shared services and decorators through packages/backend-common.

Traditional starter templates give you code. **AI-Nx-Starter gives you an AI multiplication system.**

| Traditional Development   | With AI-Nx-Starter                  |
| ------------------------- | ----------------------------------- |
| Manual API client coding  | **Auto-generated** from controllers |
| Hours writing boilerplate | **Minutes** with AI prompts         |
| Trial and error           | **Proven** prompt templates         |

**Observed Impact:** In our experience, complete CRUD features that typically take 2-3 hours can often be completed in 40-60 minutes with AI assistance. Individual results vary.

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

### 3. Start All Services (Docker)

```bash
# Start MongoDB, Redis, Backend, and Frontend
docker-compose up -d

# Verify all services are healthy
docker-compose ps
```

**Note:** For local development without Docker, you can run services individually with `npm run ui` and `npm run server` after setting up external MongoDB and Redis.

### 4. Tell Your AI Assistant

```
Read CLAUDE.md for project rules and quick reference.
Then explore /prompts/ for step-by-step task templates.
```

### 5. Access the Application

**With Docker (recommended):**

```bash
# Already running from step 3
# Frontend: http://localhost
# Backend API: http://localhost:3030/ai-nx-starter/rest/api/v2
# API Documentation: http://localhost:3030/api/docs
# Health: http://localhost:3030/health
```

**Or local development (without Docker):**

```bash
# Start dev servers (requires external MongoDB & Redis)
npm run start

# Frontend: http://localhost:4200
# Backend API: http://localhost:3030/ai-nx-starter/rest/api/v2
# API Documentation: http://localhost:3030/api/docs
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

- **`/prompts`** - 6 ready-to-use AI task templates
- **`CLAUDE.md`** - Project rules and quick reference
- **Auto-generated API clients** - Type-safe Angular services from NestJS controllers

### 🏗️ Production-Ready Stack

**Frontend:**

- Angular 19 + NG-ZORRO (Ant Design)
- RxJS + TypeScript
- Auto-generated HTTP clients

**Backend:**

- NestJS 11 + TypeORM
- MongoDB + Redis
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

### Add API Endpoints

**Just describe what you need:**

```
"Add a GET /products endpoint with pagination (limit, offset) and Admin role required"

AI automatically:
- Creates controller method with Swagger docs
- Implements service logic
- Adds validation and security
- Generates API client
- Writes unit tests
```

AI applies all standards automatically via context (`documents/api-documentation-standards.md`, `documents/security-best-practices.md`).

### Debug Build Errors

**Just share the errors naturally:**

```
"I got these build errors: [paste error output]"

AI automatically:
- Analyzes errors systematically
- Explains root causes
- Provides fixes with exact file paths
- Verifies with npm run build
```

**Time:** 5-10 minutes (vs 20-45 minutes manually)

See [CLAUDE.md](./CLAUDE.md) for project rules and [/prompts/](./prompts/) for step-by-step workflows.

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
├── prompts/                 # Complex workflow templates 🤖
│   ├── create-crud-feature.md
│   └── create-ui-component.md
├── documents/               # Architecture and AI context
└── CLAUDE.md                # Project rules and quick reference 🤖
```

## 🔄 Development Workflow

### 🤖 AI-Assisted Development

This project is designed for **AI-assisted development** with tools like **Claude Code** and **Windsurf**. Both tools automatically apply project-specific rules and coding standards based on your working directory.

#### AI Configuration

- **Claude Code**: Rules in `.claude/` directories (auto-applied per context)
- **Windsurf**: Rules in `.windsurf/rules/` (auto-applied with triggers)

Both tools automatically understand:

- Project architecture and patterns
- Coding standards and conventions
- Package dependencies and boundaries
- Best practices for each layer

**You don't need to explain the project structure** - just start coding and the AI will follow the established patterns!

### 📋 Feature Development Workflow

When implementing a new feature, follow this AI-assisted workflow:

#### Step 1: Identify Your Feature Pattern

**Before starting**, check if your feature matches an existing example pattern:

```bash
# Browse available examples
apps/web-ui/src/app/features/examples/
├── list-item/          # CRUD with list + detail view (most common)
├── forms/              # Complex form validation
├── buttons/            # Action-based features
├── decorators/         # Using utility decorators
├── exceptions/         # Error handling patterns
├── pub-sub/            # Real-time updates
└── server-events-demo/ # SSE/WebSocket patterns
```

**Most common pattern**: `list-item` - Use this for typical CRUD operations with list and detail views.

#### Step 2: Tell the AI What You Need

Simply describe your feature to Claude Code or Windsurf:

```
"Create a Product CRUD feature following the list-item pattern"
"Add a User management feature with list and detail views"
"Implement a Settings form with validation"
```

The AI will automatically:

- Create entities and DTOs in the right packages
- Generate backend controllers and services
- Follow naming conventions and architecture rules
- Apply proper validation and error handling

#### Step 3: Implement Backend (AI-Assisted)

**Example prompts for Claude Code/Windsurf:**

```
"Create a Product entity with name, description, and price fields in data-access-layer"
```

The AI will:

- Create entity in `packages/data-access-layer/src/product/`
- Create DTOs in `packages/types/dto/product/`
- Generate DbService with CRUD operations
- Follow TypeORM and MongoDB patterns

```
"Implement Product API controller and service in web-server"
```

The AI will:

- Create controller with REST endpoints
- Create service with business logic
- Create mapper for Entity ↔ DTO conversion
- Apply validation and exception handling

#### Step 4: Generate API Client

```bash
npm run gen-api-client
```

This auto-generates TypeScript API client services for the frontend.

#### Step 5: Implement Frontend (AI-Assisted)

**Example prompt:**

```
"Implement Product feature UI based on the list-item example"
```

The AI will:

- Analyze the `list-item` example pattern
- Create component structure (list, detail, form)
- Use ng-zorro components (nz-table, nz-card)
- Apply proper styling with theme variables
- Implement state management with services
- Add proper error handling and notifications

#### Step 6: Build and Validate

```bash
npm run build
```

The AI will typically run this automatically after each step to ensure no errors.

### 🎯 Tips for AI-Assisted Development

**✅ Do:**

- Reference existing examples: "based on list-item pattern"
- Be specific about requirements: "with pagination and search"
- Ask to follow patterns: "using the same structure as examples"
- Request validation after changes: "run build to check for errors"

**❌ Avoid:**

- Explaining the entire architecture (AI already knows from rules)
- Manually copying boilerplate (let AI generate it)
- Skipping the build step (always validate changes)

### 📚 Documenting Complex Features for AI

When you have a complete, well-implemented feature that should serve as a reference for future development, create a comprehensive markdown guide similar to the **Users feature example**:

**Reference**: [`apps/web-ui/src/app/features/backoffice/users/users.md`](apps/web-ui/src/app/features/backoffice/users/users.md)

This example demonstrates how to document a feature for AI consumption:

#### What to Include:

> **Note**: Exclude any general rules already defined in `.claude/instructions.md`. Focus only on feature-specific patterns, implementations, and architectural decisions unique to this feature.

#### Why This Matters:

- **AI Context**: Claude Code/Windsurf can reference these guides to understand complex implementations
- **Consistency**: New features follow established patterns automatically
- **Onboarding**: New developers (human or AI) can learn from comprehensive examples
- **Maintenance**: Clear documentation makes refactoring and updates easier

#### When to Create Feature Documentation:

- ✅ Complex features with multiple components (CRUD, forms, workflows)
- ✅ Features that establish patterns to be reused across the app
- ✅ Features with non-trivial business logic or integrations
- ✅ Reference implementations for specific UI/UX patterns

#### How AI Uses These Docs:

When you say:

```
"Create a Products feature similar to the Users feature"
```

The AI will:

1. Read `users.md` to understand the pattern
2. Identify key components and their responsibilities
3. Replicate the architecture with appropriate entity names
4. Follow the same code patterns and styling conventions
5. Maintain consistency with the reference implementation

**Pro Tip**: Place feature documentation in the feature folder (e.g., `features/users/users.md`) so Claude Code automatically sees it when working in that context.

```bash
# Development
npm run start  # Run all services
npm run ui     # Frontend only
npm run server # Backend only

# Building
npm run build      # Development build
npm run build:prod # Production build

# Code Quality
npm run lint       # Lint all projects
npm run format:fix # Auto-format code
npm run test       # Run tests

# AI Workflows
npm run gen-api-client # Generate Angular API services ⚡

# Cleanup
npm run clean      # Remove build artifacts and caches
npm run clean:deep # Deep clean (includes all packages)
```

## 🐳 Docker

```bash
# Start all services (MongoDB, Redis, Backend, Frontend)
docker-compose up -d

# Build and start (if code changed)
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (full cleanup)
docker-compose down -v

# View logs
docker-compose logs -f app    # Backend logs
docker-compose logs -f web-ui # Frontend logs

# Access
# Frontend: http://localhost
# Backend API: http://localhost:3030/ai-nx-starter/rest/api/v2
# API Documentation: http://localhost:3030/api/docs
# Health: http://localhost:3030/health

# View test coverage (after running: npm run test:coverage)
# Open: coverage/index.html in your browser
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Project rules and quick reference
- **[/prompts/](./prompts/)** - Step-by-step task templates
- **[/documents/](./documents/)** - Architecture and AI context
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute
- **[API Documentation](http://localhost:3030/api/docs)** - Interactive Swagger UI (auto-generated)

### AI Workflow Templates

- [Create CRUD Feature](./prompts/create-crud-feature.md) - Complete backend + frontend
- [Create UI Component](./prompts/create-ui-component.md) - Angular components

**Note:** Most tasks don't need templates - just use natural language:

- "Add GET /products endpoint" → AI creates endpoint, docs, tests automatically
- "I got these errors: [paste]" → AI debugs and fixes systematically
- "Add tests for user.service.ts" → AI writes comprehensive tests

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

## 📊 Development Observations

Based on our development experience with AI assistance:

- ⏱️ CRUD features: Typically 60-75% faster in our testing
- 🎯 Code generation: Higher first-try success with structured prompts
- 🧪 Test coverage: Improved coverage with AI-generated test scaffolds
- 🐛 Build errors: Fewer errors due to type-safe auto-generation

**Note:** These are observations from our development experience, not guarantees. Your results will vary.

## ⚠️ Current Limitations

Before using AI-Nx-Starter in production, be aware of these limitations:

### Testing & Quality Assurance

- **Growing test coverage**: Currently ~80% test coverage (468+ tests) with enforcement
  - User feature has comprehensive tests
  - Core CRUD operations fully tested
  - E2E testing infrastructure (6 basic tests)
  - Coverage tracked via Codecov with 80% minimum threshold
  - No visual regression testing

### Security

- **No security audit performed**: Code has not been professionally audited
- **Default configuration is development-only**:
  - In-memory session storage (not production-ready)
  - Weak default credentials in docker-compose.yml
  - No rate limiting implemented
  - Security headers not configured
- **No vulnerability scanning**: No automated dependency security scanning

### Documentation & Deployment

- **Database migrations not documented**: TypeORM migration strategy undefined
- **No deployment examples**: Production deployment guide is basic
- **No monitoring/observability**: No APM, error tracking, or logging infrastructure
- **No performance benchmarks**: No load testing or performance metrics

### Architecture & Scalability

- **Monolithic architecture**: Not suitable for microservices patterns
- **No i18n support**: Hard-coded strings, no internationalization
- **No accessibility testing**: WCAG compliance not verified
- **Bundle size not optimized**: No bundle analysis or size limits
- **No caching strategy**: Redis available but caching not implemented

### Developer Experience

- **8 ESLint warnings** in codebase (should be 0 for a starter)
- **No commit hooks**: No husky/lint-staged for pre-commit quality checks
- **No conventional commits**: Commit message format not enforced
- **TypeScript `any` types**: Type safety not strictly enforced throughout
- **No Dependabot**: Automated dependency updates not configured

### Project Maturity

- **Version 1.0.0 but feels early**: Feature set and polish don't match version number
- **No changelog until now**: Historical changes not documented
- **Placeholder URLs**: GitHub URLs reference YOUR_ORG, not actual repo
- **Limited real-world usage**: Project is new with limited production deployments

### What This Means for You

✅ **Good for**:

- Learning AI-assisted development
- Rapid prototyping and MVPs
- Personal projects and experiments
- Understanding monorepo architecture with Nx

❌ **Not ready for**:

- Production applications with real users (without significant hardening)
- Applications requiring HIPAA, SOC2, or other compliance
- High-traffic applications (no load testing performed)
- Mission-critical systems

### Our Commitment

We're working to address these limitations. See:

- [ROADMAP.md](./ROADMAP.md) for planned improvements
- [SECURITY.md](./SECURITY.md) for security considerations
- [DEPLOYMENT.md](./DEPLOYMENT.md) for production guidance
- [CHANGELOG.md](./CHANGELOG.md) for tracking progress

**Contributions welcome!** Help us improve test coverage, security, and documentation.

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
docker-compose logs mongodb
docker-compose logs redis
```

**"Module not found" errors**

```bash
# Clear cache and reinstall
npm run clean
pnpm install
```

**"Port already in use"**

```bash
# Check what's using the port
lsof -i :3030 # or :4200

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

- Check [CLAUDE.md](./CLAUDE.md) and [/prompts/](./prompts/) for AI workflow guidance
- Search [existing issues](https://github.com/YOUR_ORG/ai-nx-starter/issues)
- Ask in [Discussions](https://github.com/YOUR_ORG/ai-nx-starter/discussions)

## 💬 Support

- **Documentation:** Check [CLAUDE.md](./CLAUDE.md), [/prompts/](./prompts/), and [/documents/](./documents)
- **Issues:** [GitHub Issues](https://github.com/YOUR_ORG/ai-nx-starter/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_ORG/ai-nx-starter/discussions)

### AI Development Tools

- Claude Code (with `.claude/` rules)
- Windsurf (with `.windsurf/rules/`)
- Automatic context-aware coding standards
- Built-in architectural patterns and examples

## 📄 License

MIT © [Your Organization]

See [LICENSE](./LICENSE) for details.

---

**Built with AI assistance using Claude, demonstrating the power of AI-optimized development workflows.**

⭐ Star this repo if you found it helpful!
