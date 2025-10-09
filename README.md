# Medorion Monorepo

[Medorion](https://medorion.com) - An Nx-based monorepo for full-stack application development with Angular frontend and NestJS backend.

## 📚 Documentation

For detailed technical documentation, see the [documents](./documents) folder:

- [Overview & Table of Contents](./documents/index.md)
- [Development Workflow](./documents/dev-workflow.md)
- [Web UI Technical Guide](./documents/web-ui-technical.md)
- [Web Server Technical Guide](./documents/web-server-technical.md)
- [Data Access Layer](./documents/data-access-layer-techical.md)
- [Common Utilities](./documents/common-techical.md)
- [Migration Scripts](./documents/migration-scripts.md)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker (optional, for containerized deployment)

### Installation

```bash
npm install
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

### View Documentation Locally

Serve the documentation folder with a local HTTP server:

```bash
npm run docs
```

This will open the documentation in your browser at `http://localhost:8081`

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

For CRUD operations and feature development, follow the workflow outlined in [dev-workflow.md](./documents/dev-workflow.md):

1. Create Entity & DTOs in data-access-layer
2. Implement API (controller, service, mapper) in web-server
3. Generate API client: `npm run gen-api-client`
4. Implement UI feature based on existing examples
5. Test and build: `npm run build`

### Working wit Auth0

Set env:
AUTO_LOG_IN_DEV_USER=false
On Client: apps/web-ui/src/environments/environment.ts
autoLogInDevUser: false

### Working with no Auth0 dev user

Set env:
AUTO_LOG_IN_DEV_USER=true  
On Client: apps/web-ui/src/environments/environment.ts
autoLogInDevUser: true

When switching:

- Clear local storate and cace from Browser
- In redis: FLUSHALL

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

## 📄 License

MIT
