# Pub-Sub Event System

A comprehensive publish-subscribe event system for Angular applications providing type-safe event communication between components, services, and modules.

## Overview

The pub-sub system consists of three main parts:

1. **PubSubService** - Core generic pub-sub service
2. **EventBusService** - Higher-level service with typed methods for common events
3. **Types & Interfaces** - TypeScript definitions for type safety

## Quick Start

### Basic Usage

```typescript
import { Component, OnDestroy } from '@angular/core';
import { EventBusService } from '../core/services/event-bus.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-example',
  template: `<button (click)="notifyUser()">Send Notification</button>`
})
export class ExampleComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(private eventBus: EventBusService) {
    // Subscribe to notifications
    const sub = this.eventBus.onNotification().subscribe(event => {
      console.log('Notification received:', event.payload);
    });
    this.subscriptions.push(sub);
  }

  notifyUser() {
    // Publish a notification
    this.eventBus.publishNotification({
      id: 'success-1',
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully!'
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

## Services

### PubSubService (Core)

The low-level generic pub-sub service that provides the foundation.

#### Methods

- `publish<T>(eventType: string, payload: T, source?: string): void`
- `subscribe<T>(eventType: string, config?: SubscriptionConfig): Observable<EventPayload<T>>`
- `subscribeToMultiple<T>(eventTypes: string[], config?: SubscriptionConfig): Observable<EventPayload<T>>`
- `subscribeToAll<T>(config?: SubscriptionConfig): Observable<EventPayload<T>>`
- `hasSubscribers(eventType: string): boolean`
- `getActiveEventTypes(): string[]`
- `clear(): void`
- `getLastEvent<T>(eventType: string): EventPayload<T> | null`

#### Example

```typescript
import { PubSubService } from '../core/services/pub-sub.service';

constructor(private pubSub: PubSubService) {}

// Publish an event
this.pubSub.publish('user-action', { action: 'login', userId: '123' });

// Subscribe to events
this.pubSub.subscribe('user-action').subscribe(event => {
  console.log('User action:', event.payload);
});

// Subscribe with configuration
this.pubSub.subscribe('user-action', {
  replay: true,
  bufferSize: 5,
  debounceTime: 300,
  filter: event => event.payload.action === 'login'
}).subscribe(event => {
  // Only login events, debounced
});
```

### EventBusService (High-Level)

Provides typed methods for common application events.

#### Authentication Events

```typescript
// Publishing
this.eventBus.publishUserLoggedIn({
  userId: 'user123',
  email: 'user@example.com',
  roles: ['user'],
  token: 'jwt-token'
});

this.eventBus.publishUserLoggedOut();
this.eventBus.publishSessionExpired();

// Subscribing
this.eventBus.onUserLoggedIn().subscribe(event => {
  const user = event.payload;
  console.log(`User ${user.email} logged in`);
});
```

#### UI State Events

```typescript
// Theme changes
this.eventBus.publishThemeChanged({
  theme: 'dark',
  previousTheme: 'light'
});

this.eventBus.onThemeChanged().subscribe(event => {
  document.body.className = event.payload.theme;
});

// Sidebar toggling
this.eventBus.publishSidebarToggled(true);
this.eventBus.onSidebarToggled().subscribe(event => {
  console.log('Sidebar is', event.payload.isOpen ? 'open' : 'closed');
});

// Modal events
this.eventBus.publishModalOpened('user-settings', { userId: '123' });
this.eventBus.publishModalClosed('user-settings', { saved: true });
```

#### Data Operation Events

```typescript
// Publishing data changes
this.eventBus.publishDataLoaded({
  entityType: 'user',
  data: users,
  operation: 'create'
});

this.eventBus.publishDataUpdated({
  entityType: 'user',
  data: updatedUser,
  operation: 'update',
  id: 'user123'
});

// Subscribing to data changes
this.eventBus.onDataUpdated().subscribe(event => {
  if (event.payload.entityType === 'user') {
    // Refresh user data
    this.refreshUserList();
  }
});
```

#### Notification Events

```typescript
// Show notification
this.eventBus.publishNotification({
  id: 'notif-1',
  type: 'success',
  title: 'Success',
  message: 'Data saved successfully',
  duration: 3000,
  action: {
    label: 'Undo',
    handler: () => this.undoAction()
  }
});

// Hide notification
this.eventBus.publishNotificationHide('notif-1');

// Subscribe to notifications
this.eventBus.onNotification().subscribe(event => {
  // Display notification in UI
  this.showNotificationToast(event.payload);
});
```

#### Form Events

```typescript
// Form submission
this.eventBus.publishFormSubmitted({
  formId: 'user-form',
  formData: formValue,
  errors: validationErrors
});

// Form reset
this.eventBus.publishFormReset('user-form');

// Subscribe to form events
this.eventBus.onFormSubmitted().subscribe(event => {
  console.log('Form submitted:', event.payload.formId);
});
```

## Advanced Features

### Subscription Configuration

```typescript
const config: SubscriptionConfig = {
  replay: true,           // Receive last emitted event immediately
  bufferSize: 5,          // Keep last 5 events for replay
  debounceTime: 300,      // Debounce events by 300ms
  throttleTime: 1000,     // Throttle to max 1 event per second
  filter: event => event.payload.priority === 'high' // Custom filter
};

this.eventBus.onCustomEvent('my-event', config).subscribe(event => {
  // Handle filtered, debounced, high-priority events
});
```

### Multiple Event Subscription

```typescript
// Subscribe to multiple related events
this.eventBus.onCustomEvents([
  'data:user-updated',
  'data:user-deleted',
  'data:user-created'
]).subscribe(event => {
  // Handle any user-related data event
  this.refreshUserData();
});
```

### Custom Events

```typescript
// Publish custom events
this.eventBus.publishCustomEvent('feature:analytics', {
  action: 'page-view',
  page: '/dashboard',
  userId: this.currentUser.id
});

// Subscribe to custom events
this.eventBus.onCustomEvent<AnalyticsEvent>('feature:analytics')
  .subscribe(event => {
    this.analyticsService.track(event.payload);
  });
```

### Debug Mode

```typescript
// Enable debug mode (development only)
this.eventBus.setDebugMode(true);

// Get debug information
const debugInfo = this.eventBus.getDebugInfo();
console.log('Active events:', debugInfo.activeEventTypes);
console.log('Recent events:', debugInfo.eventHistory);
```

## Best Practices

### 1. Use EventBusService for Common Events

```typescript
// ✅ Good - Use typed methods
this.eventBus.publishUserLoggedIn(userPayload);

// ❌ Avoid - Generic pub-sub for common events
this.pubSub.publish('user:logged-in', userPayload);
```

### 2. Always Unsubscribe

```typescript
export class MyComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(private eventBus: EventBusService) {
    const sub1 = this.eventBus.onUserLoggedIn().subscribe(/*...*/);
    const sub2 = this.eventBus.onThemeChanged().subscribe(/*...*/);

    this.subscriptions.push(sub1, sub2);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

### 3. Use Meaningful Event Names

```typescript
// ✅ Good - Descriptive names
'todo:item-created'
'user:profile-updated'
'navigation:breadcrumb-changed'

// ❌ Avoid - Generic names
'update'
'change'
'event'
```

### 4. Include Context in Payloads

```typescript
// ✅ Good - Rich payload with context
this.eventBus.publishDataUpdated({
  entityType: 'todo-item',
  data: todoItem,
  operation: 'update',
  id: todoItem.id,
  userId: this.currentUser.id,
  timestamp: Date.now()
});

// ❌ Avoid - Minimal payload
this.eventBus.publishDataUpdated(todoItem);
```

### 5. Use Filters for Specific Data

```typescript
// ✅ Good - Filter for relevant data only
this.eventBus.onDataUpdated({
  filter: event => event.payload.entityType === 'todo-item'
}).subscribe(event => {
  // Only todo-item updates
});
```

## Integration Examples

### Component Communication

```typescript
// Parent Component
@Component({
  template: `<child-component (action)="onChildAction($event)"></child-component>`
})
export class ParentComponent {
  constructor(private eventBus: EventBusService) {}

  onChildAction(data: any) {
    this.eventBus.publishCustomEvent('parent:child-action', data);
  }
}

// Sibling Component
@Component({
  selector: 'sibling-component'
})
export class SiblingComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    this.subscription = this.eventBus.onCustomEvent('parent:child-action')
      .subscribe(event => {
        console.log('Child action received by sibling:', event.payload);
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
```

### Service Integration

```typescript
@Injectable()
export class AuthService {
  constructor(private eventBus: EventBusService) {}

  async login(credentials: LoginCredentials) {
    try {
      const user = await this.api.login(credentials);

      // Notify entire app of login
      this.eventBus.publishUserLoggedIn({
        userId: user.id,
        email: user.email,
        roles: user.roles,
        token: user.token
      });

      return user;
    } catch (error) {
      this.eventBus.publishAppError({
        message: 'Login failed',
        context: 'AuthService.login'
      });
      throw error;
    }
  }
}

@Injectable()
export class HeaderComponent {
  constructor(private eventBus: EventBusService) {
    // Update header when user logs in/out
    this.eventBus.onUserLoggedIn().subscribe(() => {
      this.updateUserInfo();
    });

    this.eventBus.onUserLoggedOut().subscribe(() => {
      this.clearUserInfo();
    });
  }
}
```

## Common Event Types

The system provides predefined event types in `CommonEvents`:

- **Authentication**: `USER_LOGGED_IN`, `USER_LOGGED_OUT`, `USER_SESSION_EXPIRED`
- **Navigation**: `ROUTE_CHANGED`, `PAGE_LOADED`
- **UI State**: `THEME_CHANGED`, `SIDEBAR_TOGGLED`, `MODAL_OPENED`, `MODAL_CLOSED`
- **Data Operations**: `DATA_LOADED`, `DATA_UPDATED`, `DATA_DELETED`, `DATA_ERROR`
- **Notifications**: `NOTIFICATION_SHOW`, `NOTIFICATION_HIDE`
- **Forms**: `FORM_SUBMITTED`, `FORM_RESET`, `FORM_VALIDATION_ERROR`
- **Network**: `NETWORK_ONLINE`, `NETWORK_OFFLINE`
- **Application**: `APP_INITIALIZED`, `APP_ERROR`, `CONFIG_LOADED`

## TypeScript Integration

All services and events are fully typed:

```typescript
import {
  EventPayload,
  UserLoggedInPayload,
  NotificationPayload
} from '../core/services/pub-sub.types';

// Type-safe event handling
this.eventBus.onUserLoggedIn().subscribe((event: EventPayload<UserLoggedInPayload>) => {
  // TypeScript knows the structure of event.payload
  console.log(event.payload.userId);  // ✅ Type-safe
  console.log(event.payload.invalid); // ❌ TypeScript error
});
```

## Performance Considerations

- Events are processed synchronously by default
- Use debouncing/throttling for high-frequency events
- Unsubscribe from events to prevent memory leaks
- Use filters to reduce unnecessary processing
- Consider using replay for state-dependent components

## Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { PubSubService } from './pub-sub.service';
import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;
  let pubSubService: jasmine.SpyObj<PubSubService>;

  beforeEach(() => {
    const pubSubSpy = jasmine.createSpyObj('PubSubService', ['publish', 'subscribe']);

    TestBed.configureTestingModule({
      providers: [
        EventBusService,
        { provide: PubSubService, useValue: pubSubSpy }
      ]
    });

    service = TestBed.inject(EventBusService);
    pubSubService = TestBed.inject(PubSubService) as jasmine.SpyObj<PubSubService>;
  });

  it('should publish user login event', () => {
    const payload = { userId: '123', email: 'test@example.com', roles: [], token: 'token' };

    service.publishUserLoggedIn(payload);

    expect(pubSubService.publish).toHaveBeenCalledWith(
      'user:logged-in',
      payload,
      'auth'
    );
  });
});
```