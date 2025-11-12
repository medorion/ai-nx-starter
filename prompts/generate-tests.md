# Generate Tests Prompt

## Description

Generates comprehensive unit tests for services, controllers, or components.

## Before You Start

⚠️ **IMPORTANT**: Before generating tests, consult these guidelines:

1. ✅ Read `documents/code-coverage-exclusions.md` - Determine if this code should be tested
2. ✅ Read `documents/ai-testing-guidelines.md` - Understand how to approach testing in this codebase
3. ✅ Check existing `jest.config.ts` for current exclusions

**Decision Framework**: Should this code be tested?

- ✅ **YES** if: Business logic, API controllers, services, guards, mappers, data transformation
- ❌ **NO** if: Pure presentation components, infrastructure (SSE/WebSockets), auto-generated code, simple framework wrappers

See `documents/code-coverage-exclusions.md` for the complete decision tree.

## Prompt

```
Generate unit tests for [FILE_PATH]:

FIRST: Verify this code should be tested per documents/code-coverage-exclusions.md
- Is it business logic? → Write tests
- Is it infrastructure? → Consider exclusion
- Is it presentational? → Consider exclusion

Test Requirements:
- Framework: Jest (see existing tests for syntax patterns)
- Coverage target: 80% statements/lines, 60% branches/functions
- Include:
  - Happy path scenarios
  - Error handling
  - Edge cases
  - Async operations
  - Mock dependencies

For Backend Services:
- Mock database services
- Test all public methods
- Verify error throwing
- Check proper data transformation

For Frontend Components:
- Mock API services
- Test user interactions
- Verify UI rendering
- Check form validation
- Test state management

Test Structure:
- Use describe/it blocks
- Clear test names
- AAA pattern (Arrange, Act, Assert)
- Proper mocking with jest.fn()
- Clean up after each test

After generation:
- Run: npx nx test [project-name]
- Ensure all tests pass
- Check coverage: npm run test:coverage
- Verify meets 80% threshold for statements/lines

If coverage is below threshold:
1. Don't just exclude files to meet the number
2. Review documents/code-coverage-exclusions.md for valid exclusions
3. Add tests for business-critical uncovered code
4. Document any exclusions with clear reasoning
```

## Placeholders

- `[FILE_PATH]`: Path to file being tested
- `[project-name]`: Nx project name (web-ui, web-server, etc.)

## Example Usage

```
Generate unit tests for apps/web-server/src/app/features/user/user.service.ts:

Test Requirements:
- Mock UserDbService
- Test all CRUD operations
- Test error scenarios (user not found, validation errors)
- Test UserMapper integration
- Coverage target: 85%+

[... rest of the prompt ...]
```

## Time Estimate

With AI: 10-15 minutes
Without AI: 30-60 minutes

## Related Documentation

- **`documents/code-coverage-exclusions.md`**: Decision framework for what to test vs. exclude
- **`documents/ai-testing-guidelines.md`**: How AI should approach testing in this codebase
- **`documents/testing-context-overview.md`**: Overview of how the testing documentation system works
- **`CLAUDE.md`**: Coverage thresholds and key testing principles

**Use this prompt for**: Quick test generation for a specific file

**Use the documents/ guidelines for**: Understanding whether code should be tested and making informed coverage decisions
