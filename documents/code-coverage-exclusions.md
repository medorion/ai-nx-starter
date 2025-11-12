# Code Coverage Exclusion Guidelines

## Overview

This document provides guidelines on when and how to exclude code from coverage metrics. The goal is to maintain high coverage of business logic while excluding code that provides low testing value or is impractical to test.

## Current Coverage Thresholds

- **Statements**: 80%
- **Lines**: 80%
- **Branches**: 60%
- **Functions**: 60%

## Decision Framework

When deciding whether to exclude code from coverage, ask these questions in order:

### 1. Is it Configuration or Infrastructure Code?

**EXCLUDE** if the code is:

- Entry points (`main.ts`, `polyfills.ts`)
- Environment configurations (`environments/**`)
- Module declarations (`*.module.ts`, `*-routing.module.ts`)
- Route configurations (`*.routes.ts`)
- Build/test configuration files
- Auto-generated code (e.g., `packages/api-client/**`)

**Example exclusions**:

```javascript
'!**/main.ts',
'!**/polyfills.ts',
'!**/environments/**',
'!**/*.module.ts',
'!**/*.routes.ts',
```

### 2. Is it Infrastructure/Integration Code?

**EXCLUDE** if testing requires:

- External services (databases, message queues, third-party APIs)
- Complex infrastructure setup (WebSockets, Server-Sent Events)
- Browser APIs that are difficult to mock (Notifications API, WebRTC)

**Example exclusions**:

```javascript
// Infrastructure services
'!src/app/core/services/server-side-events.service.ts',
'!src/app/core/sockets/socket.service.ts',
'!src/app/core/services/notification.service.ts',
```

**Rationale**: These are better tested through integration/E2E tests rather than unit tests.

### 3. Is it Presentational/UI-Only Code?

**EXCLUDE** if the code:

- Primarily handles template rendering
- Has minimal business logic
- Requires full component tree setup with UI framework modules
- Is mostly CSS/styling logic

**Example exclusions**:

```javascript
// Presentational components (mostly template/UI logic)
'!src/app/layout/header/**',
'!src/app/layout/footer/**',
```

**Note**: Components with business logic should NOT be excluded. Instead, extract business logic into testable services.

### 4. Is it a Utility or Helper with Low Testing Value?

**EXCLUDE** if:

- It's a simple wrapper around framework functionality
- Testing it would essentially test the framework itself
- It's a complex form utility that's better tested via E2E

**Example exclusions**:

```javascript
// Utility services that are hard to test
'!src/app/core/services/form-group.service.ts',
'!src/app/core/services/form-group-error-messages.ts',
'!src/app/shared/utils/**',
```

### 5. Is it Example/Demo Code?

**EXCLUDE** example code used for development/documentation:

```javascript
'!**/examples/**',
'!src/app/features/examples/**',
```

### 6. Is it Hard to Test BUT Business Critical?

**DO NOT EXCLUDE** - Instead, find a way to test it:

- Authentication/Authorization logic
- Data transformation/mapping
- Business rule validation
- API controllers/services
- State management

**Example**: Health endpoint was initially proposed for exclusion but the user correctly insisted on writing tests because it serves a critical monitoring function.

## How to Exclude Code

### Package-Level Exclusions (jest.config.ts)

Each package has its own `jest.config.ts` with a `collectCoverageFrom` array:

```typescript
// apps/web-ui/jest.config.ts
export default {
  // ... other config
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/**/*.config.{js,ts}',
    '!src/test-setup.ts',

    // Infrastructure exclusions
    '!src/app/core/services/server-side-events.service.ts',
    '!src/app/core/sockets/socket.service.ts',

    // Presentational components
    '!src/app/layout/header/**',
    '!src/app/layout/footer/**',
  ],
};
```

### Global Exclusions (jest.preset.js)

For patterns that apply across all packages:

```javascript
// jest.preset.js
module.exports = {
  // ... other config
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/*.spec.{js,ts}',
    '!**/*.config.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/index.ts', // Export files
    '!**/*.module.ts', // Module declarations
    '!**/main.ts', // Entry points
    '!**/environments/**', // Environment configs
  ],
};
```

### Codecov Exclusions (.codecov.yml)

For cloud-based coverage tracking:

```yaml
ignore:
  - '**/node_modules/**'
  - '**/dist/**'
  - '**/*.spec.ts'
  - '**/index.ts'
  - '**/*.module.ts'
  - 'packages/api-client/**' # Auto-generated
```

## Red Flags - When NOT to Exclude

❌ **DO NOT EXCLUDE** in these cases:

1. **Just because it's hard to test**
   - If it contains business logic, find a way to test it
   - Extract complex dependencies into mockable services
   - Use test doubles (mocks, stubs, fakes)

2. **Because current coverage is low**
   - Lowering standards is not a solution
   - Either write tests or refactor to make testable

3. **Authentication/Authorization code**
   - Security-critical code must be tested
   - Use mock services for external auth providers

4. **Data transformation logic**
   - Mappers, validators, parsers must be tested
   - These often contain subtle bugs

5. **Critical business flows**
   - Payment processing
   - User registration
   - Data synchronization

## Best Practices

### 1. Document Why Code is Excluded

Always add comments explaining exclusions:

```javascript
collectCoverageFrom: [
  'src/**/*.{js,ts}',
  // Infrastructure services - tested via E2E
  '!src/app/core/services/server-side-events.service.ts',

  // Utility services that are hard to test
  '!src/app/core/services/form-group.service.ts',

  // Presentational components (mostly template/UI logic)
  '!src/app/layout/header/**',
],
```

### 2. Review Exclusions Periodically

- Exclusions should be reviewed quarterly
- If code becomes more critical, consider removing exclusion
- If testing tools improve, reconsider hard-to-test code

### 3. Prefer Refactoring Over Exclusion

Instead of excluding:

```typescript
// Hard to test - tightly coupled to browser APIs
class ComplexComponent {
  constructor(
    private notifications: NotificationService,
    private sse: ServerSentEventsService,
  ) {}

  doBusinessLogic() {
    // Complex logic mixed with infrastructure
  }
}
```

Refactor to:

```typescript
// Easy to test - business logic extracted
class BusinessLogicService {
  calculateResult(data: Input): Output {
    // Pure business logic - easy to test
  }
}

// Minimal presentation logic - can be excluded
class SimpleComponent {
  constructor(
    private logic: BusinessLogicService,
    private notifications: NotificationService,
  ) {}
}
```

### 4. Different Standards for Different Code Types

| Code Type                 | Coverage Target | Rationale                              |
| ------------------------- | --------------- | -------------------------------------- |
| Business Logic            | 90%+            | Critical, changes frequently           |
| Services/APIs             | 80%+            | Important, well-defined contracts      |
| Components (with logic)   | 70%+            | Mixed presentation/logic               |
| Utilities                 | 80%+            | Shared code, affects multiple features |
| Presentational Components | Excluded        | Low value, better tested in E2E        |
| Infrastructure            | Excluded        | Tested via integration tests           |

## Example Decision Tree

```
Is this code business critical?
├─ YES → Write tests, do NOT exclude
│   ├─ Hard to test? → Refactor to make testable
│   └─ External dependencies? → Use mocks/stubs
│
└─ NO → Is it infrastructure/configuration?
    ├─ YES → EXCLUDE (document why)
    │   └─ Better tested via E2E/integration
    │
    └─ NO → Is it purely presentational?
        ├─ YES → EXCLUDE (if minimal logic)
        └─ NO → Write tests, do NOT exclude
```

## Current Exclusions by Package

### web-ui

- Infrastructure: SSE, Sockets, Notifications
- Utilities: Form helpers, Debug components
- Presentation: Header, Footer components
- Config: Examples, Decorators, Environments

### web-server

- Infrastructure: SSE, Exception module (test-only)
- Config: App initializer, Base classes
- Filters: Global exception filter

### backend-common

- Utilities: Crypto, Sync events, Utils
- Config: Decorators

### data-access-layer

- (Minimal exclusions - high-value code)

## Measuring Success

Good coverage exclusions should result in:

✅ **High coverage of tested code** (80%+)
✅ **Tests focus on business logic**
✅ **Faster test execution** (excluding slow integration code)
✅ **Clear separation** between unit and integration tests
✅ **Maintainable test suite**

❌ Avoid these anti-patterns:

- Excluding code just to meet thresholds
- Inconsistent exclusion criteria
- Excluding critical security code
- No documentation of why code is excluded

## Questions to Ask Before Excluding

1. **Does this code contain business logic?** → Don't exclude
2. **Would a bug here impact users directly?** → Don't exclude
3. **Is this code auto-generated?** → Exclude
4. **Is this pure configuration?** → Exclude
5. **Would testing this require complex infrastructure?** → Consider excluding, document integration test plan
6. **Is there a refactoring that would make this testable?** → Refactor instead of excluding

## Conclusion

Code coverage exclusions are a pragmatic tool, not a way to hide untested code. Use them judiciously to focus testing efforts on business-critical code while acknowledging that some infrastructure code is better tested through other means (E2E, integration tests, manual testing).

When in doubt, **write the test** rather than excluding the code.
