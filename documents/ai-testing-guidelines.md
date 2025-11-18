# AI Testing Guidelines

## Overview

This document provides guidelines for AI assistants (like Claude) when creating tests for the ai-nx-starter codebase. It explains how to use the coverage exclusion guidelines and make informed decisions about what to test.

## How to Use the Coverage Exclusion Document

When asked to create tests or improve coverage, follow this workflow:

### Step 1: Analyze the Code to be Tested

Before writing any tests, ask these questions:

1. **Read the exclusion guidelines**: Check `documents/code-coverage-guidelines.md`
2. **Check current exclusions**: Look at the relevant `jest.config.ts` file
3. **Identify the code type**: Is it business logic, infrastructure, configuration, or presentation?
4. **Review the decision framework**: Does this code fit exclusion criteria?

### Step 2: Make a Decision

Use the decision tree from `code-coverage-guidelines.md`:

```
Is this code business critical?
├─ YES → Write tests, do NOT exclude
│   ├─ Hard to test? → Refactor to make testable
│   └─ External dependencies? → Use mocks/stubs
│
└─ NO → Is it infrastructure/configuration?
    ├─ YES → EXCLUDE (document why)
    └─ NO → Is it purely presentational?
        ├─ YES → EXCLUDE (if minimal logic)
        └─ NO → Write tests, do NOT exclude
```

### Step 3: Document Your Reasoning

**Always explain your decision** to the user:

✅ **Good Example**:

```
I see that theme.service.ts contains business logic for managing
the application theme state and localStorage persistence. According
to the coverage exclusion guidelines, this is business-critical code
that should be tested. I'll write comprehensive tests for:
- Theme switching logic
- localStorage persistence
- State management
```

❌ **Bad Example**:

```
I'll write tests for theme.service.ts
```

### Step 4: Check for Existing Patterns

Before creating tests, examine existing test files to understand:

1. **Testing framework conventions**:
   - Backend uses NestJS testing utilities
   - Frontend uses Angular TestBed with Jest

2. **Mock patterns**:

   ```typescript
   // Check existing specs to see how they mock services
   const mockService = {
     method: jest.fn(),
   };
   ```

3. **Test structure**:
   ```typescript
   describe('ServiceName', () => {
     describe('methodName', () => {
       it('should handle specific case', () => {
         // Test implementation
       });
     });
   });
   ```

## Decision Matrix for AI Assistants

| Code Type                         | Action                       | Reasoning                                | Example                              |
| --------------------------------- | ---------------------------- | ---------------------------------------- | ------------------------------------ |
| **Business Logic Service**        | ✅ Write comprehensive tests | Critical functionality, high change rate | `user.service.ts`, `auth.service.ts` |
| **API Controller**                | ✅ Write tests               | Defines public contracts                 | `user.controller.ts`                 |
| **Data Mapper**                   | ✅ Write tests               | Data transformation is error-prone       | `user.mapper.ts`                     |
| **Guards/Interceptors**           | ✅ Write tests               | Security-critical                        | `authorize.guard.ts`                 |
| **DB Service**                    | ✅ Write tests               | Data access logic                        | `user.db-service.ts`                 |
| **Component with Business Logic** | ✅ Write tests               | Focus on logic, not templates            | `users-list.component.ts`            |
| **Pure Utility Functions**        | ✅ Write tests               | Shared code, affects multiple features   | `validation-utils.ts`                |
| **Theme/State Service**           | ✅ Write tests               | Application state management             | `theme.service.ts`                   |
| **Header/Footer Component**       | ❌ Suggest exclusion         | Mostly presentational, minimal logic     | `header.component.ts`                |
| **SSE/WebSocket Service**         | ❌ Suggest exclusion + E2E   | Requires real connections                | `server-side-events.service.ts`      |
| **Module Declarations**           | ❌ Already excluded          | Configuration only                       | `*.module.ts`                        |
| **Environment Files**             | ❌ Already excluded          | Configuration data                       | `environment.ts`                     |
| **Form Utilities**                | ❌ Consider exclusion        | Complex framework wrappers               | `form-group.service.ts`              |

## When User Asks "Why not exclude X?"

If the user questions an exclusion decision, **re-evaluate using the guidelines**:

### Example from History

**User**: "why not exclude health controller? why is it difficult to write tests"

**Correct Response**:

```
You're absolutely right to question this. Looking at the health controller:

1. It's an API endpoint that monitoring systems depend on
2. The logic is simple and testable (just returns status + timestamp)
3. A bug here would break monitoring/alerting

According to our coverage exclusion guidelines:
- ❌ It's business critical (monitoring)
- ❌ It's NOT infrastructure (it's a simple endpoint)
- ❌ It's NOT hard to test

Decision: I'll write tests instead of excluding it. Here's a test
that verifies the response format and timestamp validity...
```

## Common Pitfalls to Avoid

### ❌ Pitfall 1: Excluding Code to Meet Coverage Thresholds

**Wrong approach**:

```
Coverage is at 78%, we need 80%. Let me exclude these components...
```

**Right approach**:

```
Coverage is at 78%. Let me analyze what's not covered:
1. Header component - presentational only, candidate for exclusion
2. Theme service - business logic, needs tests
3. Message service - wrapper with logic, needs tests

I'll write tests for #2 and #3, and suggest excluding #1 with
documentation of why it's presentational.
```

### ❌ Pitfall 2: Using Wrong Testing Framework Syntax

**Before writing tests**, check the test setup:

```typescript
// apps/web-ui/src/test-setup.ts
import 'jest-preset-angular/setup-jest';
```

This tells you:

- ✅ Use Jest syntax (`jest.fn()`, `.mockImplementation()`)
- ✅ Angular TestBed is available
- ❌ Don't use Jasmine syntax (`spyOn` without `jest.`)

**Check for examples**:

```bash
# Look at existing tests to see patterns
grep -r "jest.fn" apps/web-ui/src/**/*.spec.ts
```

### ❌ Pitfall 3: Testing Framework Instead of Business Logic

**Wrong focus**:

```typescript
it('should inject dependencies', () => {
  expect(service).toBeDefined();
  expect(service['dependency']).toBeDefined();
});
```

**Right focus**:

```typescript
it('should calculate user discount correctly', () => {
  const result = service.calculateDiscount(user, order);
  expect(result).toBe(10.5);
});

it('should throw error for invalid discount rules', () => {
  expect(() => service.calculateDiscount(null, order)).toThrow('User is required');
});
```

### ❌ Pitfall 4: Complex Component Tests Without Proper Setup

If a component test needs extensive setup (many module imports, stub components):

**Consider**:

1. Is the component too complex? Should it be refactored?
2. Is it mostly presentational? Should it be excluded?
3. Can business logic be extracted to a testable service?

**Example from our history**:

```typescript
// Header component needs: NzIconModule, NzBreadcrumbModule,
// NzDropdownModule, NzAvatarModule, NzLayoutModule...
// → This suggests it's presentational and should be excluded
```

## Workflow for Creating Tests

### 1. Understand the Requirement

```
User: "improve coverage for web-ui"
```

**AI Response**:

```
I'll analyze the web-ui coverage to identify what needs testing.
Let me check:
1. Current coverage levels
2. What's already excluded
3. What's untested but should be tested

[Runs coverage check]

Analysis:
- Current: 78% statements
- Goal: 80% statements
- Uncovered code:
  - theme.service.ts (business logic) - NEEDS TESTS
  - header.component.ts (presentational) - CANDIDATE FOR EXCLUSION
  - message.service.ts (business logic wrapper) - NEEDS TESTS

Strategy: Write tests for theme + message services, exclude header
```

### 2. Create Tests with Context

For each test file, include:

1. **Imports**: Based on existing patterns
2. **Mock setup**: Following project conventions
3. **Test organization**: `describe` blocks for methods
4. **Comprehensive cases**: Happy path + edge cases + errors

**Template**:

```typescript
import { TestBed } from '@angular/core/testing';
import { ServiceName } from './service-name.service';

describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: any;

  beforeEach(() => {
    // Setup mocks using project conventions
    mockDependency = {
      method: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [ServiceName, { provide: DependencyService, useValue: mockDependency }],
    });

    service = TestBed.inject(ServiceName);
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      mockDependency.method.mockReturnValue('value');

      // Act
      const result = service.methodName();

      // Assert
      expect(result).toBe('expected');
      expect(mockDependency.method).toHaveBeenCalled();
    });

    it('should handle error case', () => {
      // Test error handling
    });

    it('should validate input', () => {
      // Test validation
    });
  });
});
```

### 3. Verify Against Guidelines

Before submitting tests, check:

- ✅ Does the code warrant testing per exclusion guidelines?
- ✅ Are tests using correct framework syntax?
- ✅ Do tests cover business logic, not framework features?
- ✅ Are edge cases and errors tested?
- ✅ Are mocks properly set up?

## How to Handle User Pushback

If user questions your approach:

### Example 1: User wants to exclude business logic

**User**: "Let's exclude the auth service, it's hard to test"

**AI Response**:

```
I understand the auth service is complex, but according to our
coverage exclusion guidelines (documents/code-coverage-guidelines.md):

❌ Auth/authorization is explicitly listed as code that should
   NEVER be excluded (security-critical)

Instead, I recommend:
1. Mock the external auth provider dependencies
2. Test the business logic in isolation
3. Use integration tests for the full auth flow

Let me show you how we can make it testable...
```

### Example 2: User questions an exclusion

**User**: "Why exclude the notification service?"

**AI Response**:

```
Good question! Let me review the decision:

The notification service is excluded because:
1. It's a wrapper around the browser Notifications API
2. Testing requires real browser permissions
3. It has minimal business logic (just calls browser API)
4. It's infrastructure code (per our guidelines)

However, if you want to test it, we could:
- Create a facade/interface
- Mock the browser API
- Test the wrapper logic

Would you like me to write tests for it instead of excluding it?
```

## Integration with Development Workflow

When the user is actively developing:

### New Feature Scenario

**User**: "I'm adding a user subscription feature"

**AI Should**:

1. ✅ Suggest TDD approach (tests first)
2. ✅ Create comprehensive test coverage for business logic
3. ✅ Only suggest exclusions for infrastructure/presentation
4. ✅ Remind about coverage thresholds

```
I'll help you build this with tests. Based on our 80% coverage
threshold, here's what we should test:

✅ Must test:
- SubscriptionService (business logic)
- Subscription validation rules
- Payment processing logic
- State management

❌ Can exclude:
- WebSocket connection handling (infrastructure)
- Presentational components (if logic extracted)

Let me start with the service tests...
```

## Quick Reference: Files to Check

Before creating tests, review these files:

1. **Coverage exclusions**: `documents/code-coverage-guidelines.md`
2. **Package Jest config**: `apps/[app-name]/jest.config.ts` or `packages/[pkg-name]/jest.config.ts`
3. **Global Jest config**: `jest.preset.js`
4. **Existing test patterns**: Similar `*.spec.ts` files in the same directory
5. **Test setup**: `[app-name]/src/test-setup.ts`

## Proactive Test Generation Policy

### When AI Should Automatically Write Tests (Without Being Asked)

The AI should **proactively offer or write tests** in these scenarios:

#### ✅ Always Write Tests For:

1. **New API Endpoints/Controllers**

   ```
   User: "Add a POST /api/subscriptions endpoint"

   AI Should:
   - Write the controller method
   - Automatically create controller.spec.ts tests
   - Explain: "I've added the endpoint and comprehensive tests covering
     request validation, success cases, and error handling."
   ```

2. **New Services with Business Logic**

   ```
   User: "Create a SubscriptionService to handle billing"

   AI Should:
   - Write the service
   - Automatically create service.spec.ts tests
   - Test all public methods
   ```

3. **New Guards/Interceptors/Pipes** (Security-Critical)

   ```
   User: "Add a rate limiting guard"

   AI Should:
   - Write the guard
   - Automatically create guard.spec.ts tests
   - Test security scenarios thoroughly
   ```

4. **New Mappers/Transformers**

   ```
   User: "Create a mapper for Subscription entities"

   AI Should:
   - Write the mapper
   - Automatically create mapper.spec.ts tests
   - Test data transformations
   ```

5. **When Completing CRUD Feature**

   ```
   User: "Create a full CRUD for subscriptions"

   AI Should:
   - Follow prompts/create-crud-feature.md
   - Step 4 explicitly requires: "Write unit tests for controller, service, and mapper"
   - Don't wait to be asked - tests are part of the workflow
   ```

#### ⚠️ Offer (But Don't Automatically Write) Tests For:

1. **New UI Components with Logic**

   ```
   User: "Create a subscription-form component"

   AI Should Say:
   - "I've created the component. Would you like me to write tests for
     the form validation and submission logic?"
   - Or: "I've created the component with tests for the business logic
     (form validation, API calls). The presentation layer is excluded
     per our guidelines."
   ```

2. **Utility Functions**

   ```
   User: "Add a date formatting utility"

   AI Should:
   - Write the utility
   - Offer: "This is shared code. Should I add tests to ensure it
     works correctly across different date formats?"
   ```

#### ❌ Don't Write Tests For (Unless Specifically Asked):

1. **Configuration/Module Files**
   - Already excluded from coverage
   - No business logic to test

2. **Pure Presentation Components**
   - If user creates a header/footer component
   - Suggest exclusion instead

3. **Infrastructure Code**
   - SSE/WebSocket services
   - Suggest E2E tests instead

### Policy Decision Tree

```
User creates new code
    ↓
Is it in the CRUD workflow? (prompts/create-crud-feature.md)
├─ YES → Tests are required by workflow, write them automatically
└─ NO → Continue...
    ↓
Is it business logic? (Service, Controller, Guard, Mapper)
├─ YES → Write tests automatically
│   └─ Explain what you tested and why
└─ NO → Continue...
    ↓
Is it a UI component?
├─ Has business logic → Offer to write tests
└─ Pure presentation → Suggest exclusion
    ↓
Is it infrastructure?
└─ Suggest E2E tests or exclusion
```

### How to Communicate

**Good Examples**:

✅ **Proactive (API Controller)**:

```
User: "Add a GET /api/subscriptions/:id endpoint"

AI Response:
"I've added the endpoint with comprehensive tests:

apps/web-server/src/app/features/subscription/subscription.controller.ts
- New getSubscriptionById() method with Swagger docs

apps/web-server/src/app/features/subscription/subscription.controller.spec.ts
- Test for successful retrieval
- Test for not found (404)
- Test for invalid ID format
- Test for unauthorized access

All tests pass ✓
Coverage: 95% for this controller
"
```

✅ **Offering (UI Component)**:

```
User: "Create a subscription-list component"

AI Response:
"I've created the component:

apps/web-ui/src/app/features/subscriptions/subscription-list/
- subscription-list.component.ts (with sorting/filtering logic)
- subscription-list.component.html (NG-ZORRO table)
- subscription-list.component.less

The component includes business logic for filtering and sorting.
Would you like me to write tests for this logic? Or should we
exclude the presentation layer and extract the logic to a service
that we can test more easily?
"
```

✅ **Explaining Exclusion**:

```
User: "Create a fancy animated header component"

AI Response:
"I've created the header component:

apps/web-ui/src/app/layout/header/header.component.ts

Note: This is a presentational component (mostly template/animations).
Per our coverage guidelines (documents/code-coverage-guidelines.md),
presentation components are excluded from coverage since they're better
tested via E2E tests.

If there's business logic you'd like to add (state management, API calls),
I can extract that to a testable service.
"
```

❌ **Bad Example (Silent)**:

```
User: "Add a subscription service"

AI Response:
"Here's the service:"
[Shows only the service code, no tests]

❌ Problem: User has to ask for tests separately, tests might be forgotten
```

### Integration with Existing Workflows

Update CRUD workflow in `prompts/create-crud-feature.md` to make testing explicit:

**Step 4**: Controller/Service/Mapper

- ✅ Write the code
- ✅ **Automatically write tests** (don't wait to be asked)
- ✅ Run `npm run test` to verify
- ✅ Only then proceed to step 5

### User Override

Users can always override this behavior:

```
User: "Create a subscription service, skip tests for now"

AI Should:
- Create the service without tests
- Warn: "Note: This service will need tests before PR/deployment
  (80% coverage threshold). Should I create a TODO or write them later?"
```

### Rationale

**Why proactively write tests?**

1. ✅ **Tests are required** (80% threshold)
2. ✅ **Easier to write immediately** (code is fresh in context)
3. ✅ **Prevents forgetting** (tests won't be skipped)
4. ✅ **TDD benefits** (catches issues early)
5. ✅ **Better code quality** (forces thinking about edge cases)
6. ✅ **Saves time** (user doesn't have to ask separately)

**When NOT to be proactive?**

- ❌ Presentation-only components (offer exclusion)
- ❌ Exploratory/prototype code (user might delete it)
- ❌ Infrastructure setup (needs E2E tests)

## Summary: AI Assistant Responsibilities

When working with this codebase:

1. ✅ **Read and understand** the coverage exclusion guidelines
2. ✅ **Check existing exclusions** before suggesting new ones
3. ✅ **Explain your reasoning** for test vs. exclude decisions
4. ✅ **Follow project conventions** for mocking and test structure
5. ✅ **Prioritize business logic** over framework testing
6. ✅ **Listen to user feedback** and re-evaluate decisions
7. ✅ **Suggest refactoring** when code is hard to test
8. ✅ **Document why** when suggesting exclusions
9. ✅ **Proactively write tests** for business logic (don't wait to be asked)
10. ✅ **Offer tests** for UI components with logic
11. ✅ **Suggest exclusions** for pure presentation/infrastructure code

Remember: **The goal is high-quality tests of business-critical code, not artificially inflated coverage numbers.**
