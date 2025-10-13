# API Client Package Rules

**Context**: HTTP client package (`packages/api-client`)

## Purpose

This package provides HTTP client services for communicating with the backend API.

- Used by the `web-ui` application to make API calls
- Wraps HTTP communication logic
- Handles configuration through `AppConfigService`

## Structure

- API services should be organized by feature
- Example: `src/api/example/api-example.service.ts`

## Configuration

- Use `AppConfigService` to manage API configuration
- Configuration loaded from `/apps/web-ui/src/assets/config.json`
- **NO** hardcoded API endpoints

## Best Practices

- Keep API services focused on HTTP communication only
- Return observables for reactive programming
- Use DTOs from `packages/types` for request and response types
- Handle HTTP errors appropriately
- Use proper TypeScript typing for all API calls
