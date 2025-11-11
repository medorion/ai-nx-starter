# Web UI E2E Tests

End-to-end tests for the AI-Nx-Starter application using Playwright.

## Overview

This project contains E2E tests that verify:

- **API Health** - Backend connectivity and health checks
- **Authentication** - Login/logout flows and protected routes

## Running Tests

### Prerequisites

Make sure MongoDB and Redis are running:

```bash
docker-compose up -d mongodb redis
```

### Run E2E Tests

```bash
# Headless mode (CI-like)
npm run e2e

# Headed mode (see browser)
npm run e2e:headed

# UI mode (interactive)
npm run e2e:ui
```

### Running Specific Tests

```bash
# Run a single test file
npx playwright test src/api-health.spec.ts

# Run tests matching a pattern
npx playwright test --grep "user management"

# Run in debug mode
npx playwright test --debug
```

## Project Structure

```
apps/web-ui-e2e/
├── src/
│   ├── fixtures/
│   │   └── test-data.ts          # Test data and constants
│   ├── support/
│   │   └── helpers.ts             # Helper functions
│   ├── api-health.spec.ts         # API health checks
│   └── auth.spec.ts               # Authentication tests
├── playwright.config.ts           # Playwright configuration
├── project.json                   # Nx project configuration
└── README.md                      # This file
```

## Configuration

### Environment Variables

- `BASE_URL` - Frontend URL (default: `http://127.0.0.1:4200`)
- `API_URL` - Backend API URL (default: `http://127.0.0.1:3030`)
- `CI` - Set to `true` in CI environments

### Playwright Config

The configuration is in `playwright.config.ts`:

- **Workers**: 3 locally, 1 in CI
- **Retries**: 2 in CI, 0 locally
- **Browsers**: Chromium (Firefox/Safari commented out)
- **Screenshots/Videos**: On failure only

## Writing Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { getApiEndpoint } from './support/helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ request, page }) => {
    // Your test code
  });
});
```

### Using Helpers

```typescript
import { waitForApp, navigateTo, login } from './support/helpers';

// Navigate and wait for app
await navigateTo(page, '/users');

// Login
await login(page, 'user@test.com', 'password');

// API requests
const response = await request.get(getApiEndpoint('/health'));
```

### Using Fixtures

```typescript
import { TEST_USERS, API_ENDPOINTS } from './fixtures/test-data';

// Use test data
const user = TEST_USERS.admin;
const endpoint = API_ENDPOINTS.users;
```

## CI Integration

E2E tests run automatically on:

- **Pull requests** to main
- **Pushes** to main branch

The CI workflow (`.github/workflows/e2e.yml`):

1. Starts MongoDB and Redis services
2. Builds the application
3. Starts backend and frontend servers
4. Runs E2E tests in Chromium
5. Uploads test reports and screenshots

## Debugging

### View Test Reports

```bash
# Open HTML report
npx playwright show-report
```

### Debug Failing Tests

```bash
# Run in debug mode
npx playwright test --debug

# Run with trace
npx playwright test --trace on
```

### View Traces

```bash
npx playwright show-trace trace.zip
```

## Best Practices

1. **Use test IDs** - Add `data-testid` attributes to UI elements
2. **Clean up** - Delete test data created during tests
3. **Use helpers** - Reuse common functions from `support/helpers.ts`
4. **Isolate tests** - Each test should be independent
5. **Mock external services** - Don't depend on third-party APIs

## Troubleshooting

### Tests Timeout

- Increase timeout in `playwright.config.ts`
- Check if backend/frontend are running
- Verify MongoDB and Redis are accessible

### Services Not Starting

```bash
# Check if ports are in use
lsof -i :3000 # Backend
lsof -i :4200 # Frontend

# Restart services
npm run start
```

### Playwright Installation Issues

```bash
# Reinstall browsers
npx playwright install --with-deps
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Nx Playwright Plugin](https://nx.dev/packages/playwright)
