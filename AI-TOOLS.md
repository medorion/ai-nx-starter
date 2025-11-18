# AI Tools Configuration Guide

This project is optimized for AI-assisted development and supports multiple AI coding tools.

## Supported AI Tools

### ✅ Windsurf (Primary - Used to Build This Project)

**Configuration:** `.windsurf/rules/` directory

**What's configured:**

- General project rules
- Data access layer patterns
- Web server (NestJS) conventions
- Web UI (Angular) patterns
- Type system rules

**Usage:**

1. Open project in Windsurf
2. AI automatically loads rules from `.windsurf/rules/`
3. Start coding - Windsurf understands the architecture

### ✅ Claude Code (Optimized)

**What's configured:**

- Complete project architecture
- Import rules and package structure
- Naming conventions
- Development workflow
- Common patterns and examples

**Usage:**

1. Use Claude Code CLI in project directory
2. Use prompts from `/prompts` directory for best results

### ✅ Cursor AI

**Configuration:** Create `.cursorrules` file (optional)

**Recommended setup:**

```bash
# Copy Claude rules for Cursor (if using Cursor)
cp CLAUDE.md .cursorrules
```

**Usage:**

1. Open project in Cursor
2. Cursor reads `.cursorrules`
3. Use Cmd+K with project context

### ✅ GitHub Copilot

**Configuration:** Works out of the box with inline suggestions

**Enhanced usage:**

- Read `CLAUDE.md` for project context
- Use `/prompts` templates in comments
- Copilot learns from existing code patterns

## Configuration Files Overview

```
ai-nx-starter/
├── .windsurf/               # Windsurf configuration
│   └── rules/
│       ├── general.md
│       ├── data-access-layer.md
│       ├── web-server.md
│       ├── web-ui.md
│       └── types.md
├── packages/
│   └── data-access-layer/
│       └── .windsurfrules   # Package-specific Windsurf rules
├── CLAUDE.md                # Project rules and quick reference
├── prompts/                 # Step-by-step task templates
└── documents/               # Architecture and AI context
```

## Which Tool Should I Use?

### Windsurf ⭐ (Recommended)

**Best for:**

- Full-stack development
- Complex refactoring
- Package-specific rules
- This project was built with it

**Pros:**

- Hierarchical rules (project + package level)
- Built-in cascade mode
- Strong context awareness

**Cons:**

- Newer tool, smaller community

### Claude Code

**Best for:**

- Terminal-based workflow
- Quick iterations
- Prompt-based development
- CLI automation

**Pros:**

- Powerful prompt library support
- Great documentation generation
- Strong reasoning

**Cons:**

- Terminal-only (no IDE integration)

### Cursor AI

**Best for:**

- VS Code users
- Inline code completion
- Multi-file editing
- Familiar IDE experience

**Pros:**

- VS Code integration
- Fast inline suggestions
- Good for refactoring

**Cons:**

- Less context retention

### GitHub Copilot

**Best for:**

- Autocomplete
- Boilerplate generation
- Learning patterns from code

**Pros:**

- Universal IDE support
- Fast suggestions
- Large training data

**Cons:**

- Limited project-specific rules
- Less architectural understanding

**For project-specific rules and workflows, see `CLAUDE.md` and `/prompts/` directory.**

## Tool-Specific Tips

### Windsurf Tips

**Using Cascade Mode:**

```
@cascade Create a new CRUD feature for Product
```

**Package-specific context:**

```
@data-access-layer Create a new ProductDbService
```

### Claude Code Tips

**Custom commands:**

```
Read prompts/create-crud-feature.md and create a Product feature
```

**Multi-step workflow:**

```
Step 1: Create the entity
(wait for completion)
Step 2: Create the controller
(wait and verify)
```

### Cursor Tips

**Use Tab for completions:**

- Start typing, let Cursor suggest
- Press Tab to accept

**Cmd+K for instructions:**

```
Create a Product list component following the User list pattern
```

### GitHub Copilot Tips

**Comment-driven development:**

```typescript
// Create a CRUD controller for Product with:
// - list with pagination
// - get by id
// - create
// - update
// - delete
```

## Combining Tools

**Recommended workflow:**

1. **Architecture/Planning:** Windsurf or Claude Code
2. **Implementation:** Windsurf (with cascade)
3. **Refinement:** Cursor for inline tweaks
4. **Autocomplete:** GitHub Copilot for boilerplate

## Measuring Effectiveness

Track these metrics:

- Time to complete CRUD feature
- Build errors per feature
- Test coverage achieved
- Code consistency score

**For troubleshooting and best practices, see `CLAUDE.md` and `/prompts/fix-build-errors.md`.**

## Contributing AI Improvements

Found a better prompt or configuration? Share it!

1. Add to `/prompts` directory
2. Update this guide
3. Submit PR with example usage

## Resources

- [CLAUDE.md](./CLAUDE.md) - Project rules and quick reference
- [prompts/](./prompts/) - Step-by-step task templates
- [documents/](./documents/) - Architecture and guidelines
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

---

**Built with Windsurf, optimized for all AI tools.** 🤖
