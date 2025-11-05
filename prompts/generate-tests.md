# Generate Tests Prompt

## Description

Generates comprehensive unit tests for services, controllers, or components.

## Prompt

```
Generate unit tests for [FILE_PATH]:

Test Requirements:
- Framework: Jest
- Coverage target: 80%+
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
- Check coverage report
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
