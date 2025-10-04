import { Observable } from 'rxjs';

/**
 * Generic event payload interface
 */
export interface EventPayload<T = any> {
  readonly type: string;
  readonly payload: T;
  readonly timestamp: number;
  readonly source?: string;
  readonly correlationId?: string;
}

/**
 * Event subscription configuration
 */
export interface SubscriptionConfig {
  /** Whether to receive events emitted before subscription */
  replay?: boolean;
  /** Buffer size for replayed events (default: 1) */
  bufferSize?: number;
  /** Filter function to selectively receive events */
  filter?: (event: EventPayload) => boolean;
  /** Debounce time in milliseconds */
  debounceTime?: number;
  /** Throttle time in milliseconds */
  throttleTime?: number;
}

/**
 * Event subscription handle
 */
export interface EventSubscription {
  readonly eventType: string;
  readonly subscriptionId: string;
  unsubscribe(): void;
}

/**
 * Pub-Sub service interface
 */
export interface IPubSubService {
  /**
   * Publish an event
   */
  publish<T = any>(eventType: string, payload: T, source?: string): void;

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T = any>(
    eventType: string,
    config?: SubscriptionConfig
  ): Observable<EventPayload<T>>;

  /**
   * Subscribe to multiple event types
   */
  subscribeToMultiple<T = any>(
    eventTypes: string[],
    config?: SubscriptionConfig
  ): Observable<EventPayload<T>>;

  /**
   * Subscribe to all events (useful for debugging/logging)
   */
  subscribeToAll<T = any>(
    config?: SubscriptionConfig
  ): Observable<EventPayload<T>>;

  /**
   * Check if there are any subscribers for an event type
   */
  hasSubscribers(eventType: string): boolean;

  /**
   * Get list of all active event types
   */
  getActiveEventTypes(): string[];

  /**
   * Clear all subscribers and replay buffers
   */
  clear(): void;

  /**
   * Get the last emitted event for a specific type
   */
  getLastEvent<T = any>(eventType: string): EventPayload<T> | null;
}

/**
 * Common event types for the application
 */
export const CommonEvents = {
  // Authentication
  USER_LOGGED_IN: 'user:logged-in',
  USER_LOGGED_OUT: 'user:logged-out',
  USER_SESSION_EXPIRED: 'user:session-expired',

  // Navigation
  ROUTE_CHANGED: 'navigation:route-changed',
  PAGE_LOADED: 'navigation:page-loaded',

  // UI State
  THEME_CHANGED: 'ui:theme-changed',
  SIDEBAR_TOGGLED: 'ui:sidebar-toggled',
  MODAL_OPENED: 'ui:modal-opened',
  MODAL_CLOSED: 'ui:modal-closed',

  // Data Operations
  DATA_LOADED: 'data:loaded',
  DATA_UPDATED: 'data:updated',
  DATA_DELETED: 'data:deleted',
  DATA_ERROR: 'data:error',

  // Notifications
  NOTIFICATION_SHOW: 'notification:show',
  NOTIFICATION_HIDE: 'notification:hide',

  // Form Events
  FORM_SUBMITTED: 'form:submitted',
  FORM_RESET: 'form:reset',
  FORM_VALIDATION_ERROR: 'form:validation-error',

  // Network
  NETWORK_ONLINE: 'network:online',
  NETWORK_OFFLINE: 'network:offline',

  // Application Lifecycle
  APP_INITIALIZED: 'app:initialized',
  APP_ERROR: 'app:error',
  CONFIG_LOADED: 'app:config-loaded',
} as const;

export type CommonEventType = typeof CommonEvents[keyof typeof CommonEvents];

/**
 * Predefined payload types for common events
 */
export interface UserLoggedInPayload {
  userId: string;
  email: string;
  roles: string[];
  token: string;
}

export interface RouteChangedPayload {
  from: string;
  to: string;
  params: Record<string, any>;
}

export interface ThemeChangedPayload {
  theme: 'light' | 'dark';
  previousTheme: 'light' | 'dark';
}

export interface NotificationPayload {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface DataOperationPayload<T = any> {
  entityType: string;
  data: T;
  operation: 'create' | 'update' | 'delete';
  id?: string;
}

export interface FormEventPayload {
  formId: string;
  formData: any;
  errors?: Record<string, string[]>;
}

/**
 * HTTP Error payload interface for all error events
 */
export interface HttpErrorPayload {
  status: number;
  message: string;
  url: string;
  method: string;
  timestamp: number;
  error: any;
  type: string;
  userMessage: string;
}

/**
 * Session Expired payload (ErrorStatusCode.SessionExpired = 455)
 */
export interface SessionExpiredPayload extends HttpErrorPayload {
  type: 'SessionExpired';
}

/**
 * App Warning payload (ErrorStatusCode.AppWarning = 456)
 */
export interface AppWarningPayload extends HttpErrorPayload {
  type: 'AppWarning';
}

/**
 * Concurrency Exception payload (ErrorStatusCode.ConcurencyException = 457)
 */
export interface ConcurrencyExceptionPayload extends HttpErrorPayload {
  type: 'ConcurrencyException';
}

/**
 * Unauthorized Login payload (ErrorStatusCode.UnauthorizedLogin = 458)
 */
export interface UnauthorizedLoginPayload extends HttpErrorPayload {
  type: 'UnauthorizedLogin';
}

/**
 * App Error payload (ErrorStatusCode.AppError = 459)
 */
export interface AppErrorPayload extends HttpErrorPayload {
  type: 'AppError';
}

 