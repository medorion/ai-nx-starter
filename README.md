# AI-Nx-Starter

> **AI-Optimized Full-Stack Development** - Build production-ready applications 10x faster with AI assistance

> 🤖 **AI-First Development**: This project is optimized for AI-assisted development with Claude Code and Windsurf. Built-in rules and patterns enable rapid feature development with minimal manual coding.

**Clear And Well Defined Stucture**:
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
| Inconsistent patterns     | **Enforced** via .clinerules        |
| Trial and error           | **Proven** prompt templates         |

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

# Frontend: http://localhost:4200
# Backend API: http://localhost:4200/api
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

## 🔨 Building the Application

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

- Check [AI-DEVELOPMENT.md](./AI-DEVELOPMENT.md) for AI workflow issues
- Search [existing issues](https://github.com/YOUR_ORG/ai-nx-starter/issues)
- Ask in [Discussions](https://github.com/YOUR_ORG/ai-nx-starter/discussions)

## 💬 Support

- **Documentation:** Check [documents/](./documents) and [AI-DEVELOPMENT.md](./AI-DEVELOPMENT.md)
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
