# Contributing to AI-Nx-Starter

Thank you for your interest in contributing to AI-Nx-Starter! This project is designed to showcase AI-assisted development workflows, and we welcome contributions that improve the reference implementation.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [AI-First Development](#ai-first-development)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)
- Screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- Use a clear, descriptive title
- Provide detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include examples of how it would work

### Contributing Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork
7. Open a Pull Request

## Development Workflow

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-nx-starter.git
cd ai-nx-starter

# Install dependencies
pnpm install

# Run development servers
npm run start
```

### Working on Features

This project is designed for AI-assisted development. We encourage using AI coding assistants like Claude Code, GitHub Copilot, or Cursor:

1. **Read `CLAUDE.md`** - Quick reference and critical rules
2. **Review `/documents`** - Architecture patterns and standards (auto-applied by AI)
   - Files follow `{topic}-{type}.md` naming: `-architecture`, `-standards`, `-guidelines`
3. **Use natural language** - Most tasks don't need special prompts (e.g., "Add a GET /products endpoint")
4. **Complex workflows** - See `/prompts/` for step-by-step templates (CRUD features, UI components)
5. **Generate API clients** - Run `npm run gen-api-client` after backend changes

### Testing

```bash
# Run all tests
npx nx run-many --target=test --all

# Run specific project tests
npx nx test web-ui
npx nx test web-server

# Run linting
npm run lint

# Format code
npm run format:fix
```

### Building

```bash
# Development build
npm run build

# Production build
npm run build:prod
```

## AI-First Development

This project showcases AI-assisted development. When contributing:

- **Use natural language** - Describe what you need; AI applies standards automatically
- **Document complex workflows** - Add step-by-step templates to `/prompts/` if creating reusable patterns
- **Follow established patterns** - AI reads `/documents/` for architecture and standards
- **Include AI context in PRs** - Mention if AI was used and any significant prompts/approaches

## Pull Request Process

1. **Update Documentation**: Ensure all relevant docs are updated
2. **Follow Conventions**: Adhere to naming conventions and project structure
3. **Test Thoroughly**: All tests must pass (80% coverage threshold)
4. **Update Changelog**: Add entry to CHANGELOG.md under `[Unreleased]`
5. **AI Context**: If using AI, mention approach in PR description
6. **Clean Commits**: Squash commits if necessary for clean history

### PR Checklist

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Commit messages are clear
- [ ] Changes are backward compatible (or breaking changes documented)

## Coding Standards

### General Guidelines

- **TypeScript**: All code must be TypeScript with proper typing
- **Linting**: Follow ESLint configuration
- **Formatting**: Use Prettier (run `npm run format:fix`)
- **Comments**: Add comments for complex logic

### Frontend (Angular)

- Follow Angular style guide
- Use feature-based folder organization
- Component naming: `feature-name.component.ts`
- Service naming: `feature-name.service.ts`
- Use NG-ZORRO components consistently
- See `documents/web-ui-architecture.md` for details

### Backend (NestJS)

- Module/Controller/Service pattern
- Never use TypeORM directly (use data-access-layer)
- DTOs in `@ai-nx-starter/types` package
- Use class-validator for validation
- Add Swagger decorators to all endpoints (see `documents/api-documentation-standards.md`)
- Follow security standards (see `documents/security-standards.md`)
- See `documents/web-server-architecture.md` for details

### Data Access Layer

- Entities in `/entities` folder
- DbServices in `/services` folder
- Naming: `EntityNameDbService`
- See `documents/data-access-layer-architecture.md` for details

### Naming Conventions

- **Files**: kebab-case (`user-profile.component.ts`)
- **Classes**: PascalCase (`UserProfileComponent`)
- **Variables**: camelCase (`userName`)
- **Constants**: UPPER_SNAKE_CASE (`API_PREFIX`)

## Project Structure

```
ai-nx-starter/
├── apps/
│   ├── web-ui/          # Angular frontend
│   └── web-server/      # NestJS backend
├── packages/
│   ├── api-client/      # Auto-generated Angular services
│   ├── backend-common/  # Shared backend utilities
│   ├── data-access-layer/ # Database access layer
│   └── types/           # Shared TypeScript types
├── documents/           # Technical documentation
├── prompts/            # AI prompt examples
└── scripts/            # Build and utility scripts
```

## Questions?

- Open an issue for questions
- Review existing documentation in `/documents`
- Check `CLAUDE.md` and `/prompts/` for AI workflow questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
