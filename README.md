# Monorepo Kit

An Nx-based monorepo for full-stack application development with Angular frontend and NestJS backend.

> 🤖 **AI-First Development**: This project is optimized for AI-assisted development with Claude Code and Windsurf. Built-in rules and patterns enable rapid feature development with minimal manual coding.

> 🤖 **Clear And Well Defined Stucrure**: This project provides strict rules and patterns for the development of full-stack applications with Angular frontend and NestJS backend.
> This makes it optimized for AI assisted development.

> 🤖 **UI**:

- Exept from some usecases, UI is generated automatically by AI and scricly usess ng-zorro components in order to avoid mess in the codebase.
- Under core folder we have predefined decorators, services and components that will simplify the development process and ai is instucted to use them. i.e Logging , Events, PubSub, etc.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker (optional, for containerized deployment)

### Installation

if no pnpm installed:

```bash
npm install -g pnpm
```

```bash
pnpm install
```

## 🏃 Running the Application

### Run Everything (Development Mode)

Start all applications in parallel with live reload:

```bash
npm run start
```

This runs all apps in development mode with output streaming and inspect mode enabled.

### Run Individual Applications

**Web UI (Angular):**

```bash
npm run ui
```

Frontend will be available at `http://localhost:8081`

**Web Server (NestJS):**

```bash
npm run server
```

Backend API will be available at `http://localhost:8081`

## 🔨 Building the Application

### Development Build

```bash
npm run build
```

Or build specific projects:

```bash
npx nx run-many --target=build --projects=web-ui,web-server
```

### Production Build

```bash
npm run build:prod
```

Builds all projects in production mode with optimizations.

## 🛠️ Development Commands

### Generate API Client

After creating or updating backend controllers, regenerate the API client for the frontend:

```bash
npm run gen-api-client
```

### Code Formatting

**Check formatting:**

```bash
npm run format:check
```

**Fix formatting:**

```bash
npm run format:fix
```

### Linting

```bash
npx nx run-many --target=lint --all
```

### Testing

```bash
npx nx run-many --target=test --all
```

## 🐳 Docker

### Build Docker Image

```bash
./build-docker.sh
```

### Run with Docker Compose

```bash
docker-compose up
```

## 📁 Project Structure

```
monorepo-kit/
├── apps/
│   ├── web-ui/          # Angular frontend application
│   └── web-server/      # NestJS backend application
├── packages/            # Shared libraries and utilities
├── documents/           # Technical documentation
├── scripts/             # Build and utility scripts
├── docker-compose.yml   # Docker composition
├── Dockerfile           # Docker image definition
└── nx.json              # Nx workspace configuration
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

## 🏗️ Technology Stack

### Frontend

- Angular 19
- NG-ZORRO (Ant Design)
- RxJS
- TypeScript

### Backend

- NestJS 11
- TypeORM
- PostgreSQL
- MongoDB
- Redis (Bull queues)
- Pino Logger

### DevOps & Tools

- Nx monorepo
- Docker
- ESLint & Prettier
- Jest (testing)
- Playwright (e2e testing)

### AI Development Tools

- Claude Code (with `.claude/` rules)
- Windsurf (with `.windsurf/rules/`)
- Automatic context-aware coding standards
- Built-in architectural patterns and examples

## 📄 License

MIT
