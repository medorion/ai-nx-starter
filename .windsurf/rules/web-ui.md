---
trigger: model_decision
description: This applays only for apps/web-ui
---

This applays only for apps/web-ui

# Web UI Windsurf Rules

This document defines coding standards and architectural rules for the Angular Web UI application.

## Naming Conventions

### File Naming

- MUST use kebab-case for all file names
- MUST use Angular-recommended suffixes: `.component.ts`, `.service.ts`, `.directive.ts`, `.pipe.ts`, `.module.ts`
- MUST use descriptive names that clearly indicate purpose

### Entity/DTO/Model Naming

- MUST use clear suffixes: `Dto`, `Entity`, `Model`
- MUST be descriptive and domain-specific

### Folder Organization

- MUST use feature-based folder organization (not type-based)
- Group related functionality together
- Keep components, services, and models for a feature in the same directory

**Structure:**

```
/features
  /user-management
    /components
    /services
    /models
  /patient-care
    /components
    /services
    /models
```

### AppConfigService Rules

- Configuration MUST be handled through `AppConfigService` (located in api-client package)
- Config file location: `/apps/web-ui/src/assets/config.json`
- Configuration MUST be generated from Docker ENV variables
- NO hardcoded configuration values in components/services

## Styling Rules

### LESS Usage

- MUST use `.less` files for all styling
- DO NOT use inline styles in components
- For margines and padding use helper classes from theme-general.less i.e mt-1 , p-2 ...
- USE ng-zorro built-in styles and classes whenever possible
- USE for font predefined classes from theme-general.less: fw-bold, fw-light...

### Global Styling

- HTML base element styles can ONLY be overridden in:
  - `apps/web-ui/src/assets/styles/theme.less`
  - Corresponding dark theme files
- DO NOT modify font or background colors in component `.less` files
- ALL colors MUST be defined in global styles using theme variables
- font-size, font-weight use predefined from theme-general.less
- For forms use predefined form-section

### Data Binding

- DO NOT use functions in dta binding use ng-Swithch or maps ...

### Theme Variables

```less
// ✅ Correct - use theme variables
.my-component {
  color: @text-color;
  background: @background-color-base;
}

// ❌ Wrong - hardcoded colors
.my-component {
  color: #333;
  background: #fff;
}
```

## Data Binding

- Avoid using functions in data binding, try using ngSwitch , maps ...

## Form Validation

### Validation Strategy

- MUST use class-validator decorators for data validation
- MUST use built-in Angular validators for form validation
- MUST use `FormGroupService` for handling complex form validation
- Reference implementation: `features/zorro-components/forms`

## UI Components

- Components should be standalone: false by default, true only if specified differently

### General

- Always use separate files for html,less , and ts

### List and Detail Views

- MUST use `nz-table` for list views
- MUST use `nz-card` for item/detail views
- Reference implementation: `features/zorro-components/list-and-item`

## Logging

- Use our LoggerService

### LoggerService Usage

- ALL logging MUST go through `LoggerService` wrapper
- Configure log levels via environment configurations
- MUST integrate with Angular's `ErrorHandler` for global crash reporting
- NEVER log sensitive information (passwords, tokens, PII)
- Optionally send critical logs to backend/SaaS logger

## Error Handling

### Global Error Strategy

- MUST implement global error handling
- Optionally report to backend/Sentry for monitoring

### User Feedback Rules

- **Quick feedback** → `MessageService` (wraps `NzMessageService`)
- **Contextual feedback** → `NotificationService` (wraps `NzNotificationService`)
- **Static warnings** → `<nz-alert>` component
- **Confirmations** → `nz-popconfirm` for simple confirmations
- **Critical confirmations** → `NzModalService` for blocking dialogs

## HTTP Communication

- MUST use api-client package for HTTP communication . ie. `packages/api-client/src/api/example/api-example.service.ts`

## State Management

### Service-Based State

- MUST use services with `BehaviorSubject` for state management
- AVOID complex state management libraries for this application
- Follow reactive programming patterns with RxJS

**Template:**

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureStoreService {
  private readonly _state$ = new BehaviorSubject<StateType | null>(null);

  // Read-only observable
  readonly state$ = this._state$.asObservable();

  // Synchronous getter
  get state(): StateType | null {
    return this._state$.value;
  }

  // State mutations
  updateState(newState: StateType) {
    this._state$.next(newState);
  }

  clearState() {
    this._state$.next(null);
  }
}
```

### Alerting, Messaging, Confirmation

- Quick feedback → MessageService (wraps NzMessageService)
- Feedback with context/details → NotificationService (wraps NzNotificationService)
- Static inline warnings/errors → <nz-alert>
- For confirmation use nz-popconfirm
- Critical confirmation / blocking errors → NzModalService

## Available Decorators

### Utility Decorators

- `@catchError()` - Error handling
- `@log()` - Method logging
- `@measure()` - Performance measurement
- `@debounce(300)` - Input debouncing
- `@engagement()` - TODO: User engagement tracking
- `@requireRole('admin')` - TODO: Role-based access
- `@minFeatureFlag('feature')` - TODO: Feature flag requirements

## Available Directives

### Custom Directives

- `appHideInProd` - TODO: Hide elements in production
- Role-based directives - TODO: Implement role-based visibility

## Available Components

### Utility Components

- Busy indicator component
- Display Flow component (for async operations)
- Standardized context menu component

## Available Utilities

### Helper Functions

- `sleep()` function for delays/testing

## Internationalization

### Language Support

- DEFAULT language: `en_US`
- CURRENTLY supporting `en_US` only
- Prepare for future multi-language support

### Icons

Update icons module if using new icon /shared/icons/icons.module.ts

## Routing

### Route Organization

- Follow feature-based routing structure
- Reference implementation: `features/zorro-components/list-item`
- Use lazy loading for feature modules

## Code Quality Rules

### General Principles

- Write self-documenting code with clear naming
- Use TypeScript strict mode
- Follow reactive programming patterns
- Maintain separation of concerns
- Use dependency injection properly
- Write testable code with minimal coupling
- Aviid using modals

### Performance Considerations

- Use OnPush change detection where appropriate
- Implement proper subscription management (use takeUntil pattern)
- Optimize bundle size with lazy loading
- Use track-by functions in \*ngFor loops for large lists
