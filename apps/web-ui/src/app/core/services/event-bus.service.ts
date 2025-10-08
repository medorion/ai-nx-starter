import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PubSubService } from './pub-sub.service';
import {
  CommonEvents,
  EventPayload,
  SubscriptionConfig,
  UserLoggedInPayload,
  RouteChangedPayload,
  ThemeChangedPayload,
  NotificationPayload,
  DataOperationPayload,
  FormEventPayload,
  HttpErrorPayload,
  SessionExpiredPayload,
  AppWarningPayload,
  ConcurrencyExceptionPayload,
  UnauthorizedPayload,
  AppErrorPayload,
  ForbiddenPayload,
} from './pub-sub.types';

/**
 * Higher-level event bus service that provides typed methods for common events
 * This wraps the generic PubSubService with specific event types
 */
@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  constructor(private pubSubService: PubSubService) {}

  // Authentication Events

  publishUserLoggedIn(payload: UserLoggedInPayload): void {
    this.pubSubService.publish(CommonEvents.USER_LOGGED_IN, payload, 'auth');
  }

  onUserLoggedIn(config?: SubscriptionConfig): Observable<EventPayload<UserLoggedInPayload>> {
    return this.pubSubService.subscribe<UserLoggedInPayload>(CommonEvents.USER_LOGGED_IN, config);
  }

  publishUserLoggedOut(): void {
    this.pubSubService.publish(CommonEvents.USER_LOGGED_OUT, null, 'auth');
  }

  onUserLoggedOut(config?: SubscriptionConfig): Observable<EventPayload<null>> {
    return this.pubSubService.subscribe<null>(CommonEvents.USER_LOGGED_OUT, config);
  }

  publishSessionExpired(): void {
    this.pubSubService.publish(CommonEvents.USER_SESSION_EXPIRED, null, 'auth');
  }

  onSessionExpired(config?: SubscriptionConfig): Observable<EventPayload<null>> {
    return this.pubSubService.subscribe<null>(CommonEvents.USER_SESSION_EXPIRED, config);
  }

  // Navigation Events

  publishRouteChanged(payload: RouteChangedPayload): void {
    this.pubSubService.publish(CommonEvents.ROUTE_CHANGED, payload, 'router');
  }

  onRouteChanged(config?: SubscriptionConfig): Observable<EventPayload<RouteChangedPayload>> {
    return this.pubSubService.subscribe<RouteChangedPayload>(CommonEvents.ROUTE_CHANGED, config);
  }

  publishPageLoaded(url: string): void {
    this.pubSubService.publish(CommonEvents.PAGE_LOADED, { url }, 'navigation');
  }

  onPageLoaded(config?: SubscriptionConfig): Observable<EventPayload<{ url: string }>> {
    return this.pubSubService.subscribe<{ url: string }>(CommonEvents.PAGE_LOADED, config);
  }

  // UI State Events

  publishThemeChanged(payload: ThemeChangedPayload): void {
    this.pubSubService.publish(CommonEvents.THEME_CHANGED, payload, 'ui');
  }

  onThemeChanged(config?: SubscriptionConfig): Observable<EventPayload<ThemeChangedPayload>> {
    return this.pubSubService.subscribe<ThemeChangedPayload>(CommonEvents.THEME_CHANGED, config);
  }

  publishSidebarToggled(isOpen: boolean): void {
    this.pubSubService.publish(CommonEvents.SIDEBAR_TOGGLED, { isOpen }, 'ui');
  }

  onSidebarToggled(config?: SubscriptionConfig): Observable<EventPayload<{ isOpen: boolean }>> {
    return this.pubSubService.subscribe<{ isOpen: boolean }>(CommonEvents.SIDEBAR_TOGGLED, config);
  }

  publishModalOpened(modalId: string, data?: any): void {
    this.pubSubService.publish(CommonEvents.MODAL_OPENED, { modalId, data }, 'ui');
  }

  onModalOpened(config?: SubscriptionConfig): Observable<EventPayload<{ modalId: string; data?: any }>> {
    return this.pubSubService.subscribe<{ modalId: string; data?: any }>(CommonEvents.MODAL_OPENED, config);
  }

  publishModalClosed(modalId: string, result?: any): void {
    this.pubSubService.publish(CommonEvents.MODAL_CLOSED, { modalId, result }, 'ui');
  }

  onModalClosed(config?: SubscriptionConfig): Observable<EventPayload<{ modalId: string; result?: any }>> {
    return this.pubSubService.subscribe<{ modalId: string; result?: any }>(CommonEvents.MODAL_CLOSED, config);
  }

  // Data Events

  publishDataLoaded<T = any>(payload: DataOperationPayload<T>): void {
    this.pubSubService.publish(CommonEvents.DATA_LOADED, payload, 'data');
  }

  onDataLoaded<T = any>(config?: SubscriptionConfig): Observable<EventPayload<DataOperationPayload<T>>> {
    return this.pubSubService.subscribe<DataOperationPayload<T>>(CommonEvents.DATA_LOADED, config);
  }

  publishDataUpdated<T = any>(payload: DataOperationPayload<T>): void {
    this.pubSubService.publish(CommonEvents.DATA_UPDATED, payload, 'data');
  }

  onDataUpdated<T = any>(config?: SubscriptionConfig): Observable<EventPayload<DataOperationPayload<T>>> {
    return this.pubSubService.subscribe<DataOperationPayload<T>>(CommonEvents.DATA_UPDATED, config);
  }

  publishDataDeleted<T = any>(payload: DataOperationPayload<T>): void {
    this.pubSubService.publish(CommonEvents.DATA_DELETED, payload, 'data');
  }

  onDataDeleted<T = any>(config?: SubscriptionConfig): Observable<EventPayload<DataOperationPayload<T>>> {
    return this.pubSubService.subscribe<DataOperationPayload<T>>(CommonEvents.DATA_DELETED, config);
  }

  publishDataError(error: { message: string; code?: string; details?: any }): void {
    this.pubSubService.publish(CommonEvents.DATA_ERROR, error, 'data');
  }

  onDataError(config?: SubscriptionConfig): Observable<EventPayload<{ message: string; code?: string; details?: any }>> {
    return this.pubSubService.subscribe<{
      message: string;
      code?: string;
      details?: any;
    }>(CommonEvents.DATA_ERROR, config);
  }

  // Notification Events

  publishNotification(payload: NotificationPayload): void {
    this.pubSubService.publish(CommonEvents.NOTIFICATION_SHOW, payload, 'notification');
  }

  onNotification(config?: SubscriptionConfig): Observable<EventPayload<NotificationPayload>> {
    return this.pubSubService.subscribe<NotificationPayload>(CommonEvents.NOTIFICATION_SHOW, config);
  }

  publishNotificationHide(notificationId: string): void {
    this.pubSubService.publish(CommonEvents.NOTIFICATION_HIDE, { id: notificationId }, 'notification');
  }

  onNotificationHide(config?: SubscriptionConfig): Observable<EventPayload<{ id: string }>> {
    return this.pubSubService.subscribe<{ id: string }>(CommonEvents.NOTIFICATION_HIDE, config);
  }

  // Form Events

  publishFormSubmitted(payload: FormEventPayload): void {
    this.pubSubService.publish(CommonEvents.FORM_SUBMITTED, payload, 'form');
  }

  onFormSubmitted(config?: SubscriptionConfig): Observable<EventPayload<FormEventPayload>> {
    return this.pubSubService.subscribe<FormEventPayload>(CommonEvents.FORM_SUBMITTED, config);
  }

  publishFormReset(formId: string): void {
    this.pubSubService.publish(CommonEvents.FORM_RESET, { formId }, 'form');
  }

  onFormReset(config?: SubscriptionConfig): Observable<EventPayload<{ formId: string }>> {
    return this.pubSubService.subscribe<{ formId: string }>(CommonEvents.FORM_RESET, config);
  }

  publishFormValidationError(payload: FormEventPayload): void {
    this.pubSubService.publish(CommonEvents.FORM_VALIDATION_ERROR, payload, 'form');
  }

  onFormValidationError(config?: SubscriptionConfig): Observable<EventPayload<FormEventPayload>> {
    return this.pubSubService.subscribe<FormEventPayload>(CommonEvents.FORM_VALIDATION_ERROR, config);
  }

  // Network Events

  publishNetworkOnline(): void {
    this.pubSubService.publish(CommonEvents.NETWORK_ONLINE, null, 'network');
  }

  onNetworkOnline(config?: SubscriptionConfig): Observable<EventPayload<null>> {
    return this.pubSubService.subscribe<null>(CommonEvents.NETWORK_ONLINE, config);
  }

  publishNetworkOffline(): void {
    this.pubSubService.publish(CommonEvents.NETWORK_OFFLINE, null, 'network');
  }

  onNetworkOffline(config?: SubscriptionConfig): Observable<EventPayload<null>> {
    return this.pubSubService.subscribe<null>(CommonEvents.NETWORK_OFFLINE, config);
  }

  // Application Events

  publishAppInitialized(config?: any): void {
    this.pubSubService.publish(CommonEvents.APP_INITIALIZED, config, 'app');
  }

  onAppInitialized(config?: SubscriptionConfig): Observable<EventPayload<any>> {
    return this.pubSubService.subscribe<any>(CommonEvents.APP_INITIALIZED, config);
  }

  publishConfigLoaded(config: any): void {
    this.pubSubService.publish(CommonEvents.CONFIG_LOADED, config, 'app');
  }

  onConfigLoaded(config?: SubscriptionConfig): Observable<EventPayload<any>> {
    return this.pubSubService.subscribe<any>(CommonEvents.CONFIG_LOADED, config);
  }

  // HTTP Error Events - Specific events for ErrorStatusCode enum values

  /**
   * Publish HTTP Session Expired event (ErrorStatusCode.SessionExpired = 455)
   */
  publishSessionExpiredHttp(payload: SessionExpiredPayload): void {
    this.pubSubService.publish('http:session-expired', payload, 'http');
  }

  /**
   * Subscribe to HTTP Session Expired events
   */
  onSessionExpiredHttp(config?: SubscriptionConfig): Observable<EventPayload<SessionExpiredPayload>> {
    return this.pubSubService.subscribe<SessionExpiredPayload>('http:session-expired', config);
  }

  /**
   * Publish App Error event (ErrorStatusCode.AppError = 459)
   */
  publishAppErrorHttp(payload: AppErrorPayload): void {
    this.pubSubService.publish('http:app-error', payload, 'http');
  }

  /**
   * Subscribe to App Error events
   */
  onAppErrorHttp(config?: SubscriptionConfig): Observable<EventPayload<AppErrorPayload>> {
    return this.pubSubService.subscribe<AppErrorPayload>('http:app-error', config);
  }

  /**
   * Publish App Warning event (ErrorStatusCode.AppWarning = 456)
   */
  publishAppWarningHttp(payload: AppWarningPayload): void {
    this.pubSubService.publish('http:app-warning', payload, 'http');
  }

  /**
   * Subscribe to App Warning events
   */
  onAppWarningHttp(config?: SubscriptionConfig): Observable<EventPayload<AppWarningPayload>> {
    return this.pubSubService.subscribe<AppWarningPayload>('http:app-warning', config);
  }

  /**
   * Publish Concurrency Exception event (ErrorStatusCode.ConcurencyException = 457)
   */
  publishConcurrencyExceptionHttp(payload: ConcurrencyExceptionPayload): void {
    this.pubSubService.publish('http:concurrency-exception', payload, 'http');
  }

  /**
   * Subscribe to Concurrency Exception events
   */
  onConcurrencyExceptionHttp(config?: SubscriptionConfig): Observable<EventPayload<ConcurrencyExceptionPayload>> {
    return this.pubSubService.subscribe<ConcurrencyExceptionPayload>('http:concurrency-exception', config);
  }

  /**
   * Publish Unauthorized Login event (ErrorStatusCode.UnauthorizedLogin = 401)
   */
  publishUnauthorizedHttp(payload: UnauthorizedPayload): void {
    this.pubSubService.publish('http:unauthorized', payload, 'http');
  }

  /**
   * Subscribe to Unauthorized Login events
   */
  onUnauthorizedHttp(config?: SubscriptionConfig): Observable<EventPayload<UnauthorizedPayload>> {
    return this.pubSubService.subscribe<UnauthorizedPayload>('http:unauthorized', config);
  }

  /**
   * Publish Forbidden Login event (ErrorStatusCode.UnauthorizedLogin = 403)
   */
  publishForbiddenHttp(payload: ForbiddenPayload): void {
    this.pubSubService.publish('http:forbidden', payload, 'http');
  }

  /**
   * Subscribe to Forbidden Login events
   */
  onForbiddenHttp(config?: SubscriptionConfig): Observable<EventPayload<UnauthorizedPayload>> {
    return this.pubSubService.subscribe<UnauthorizedPayload>('http:forbidden', config);
  }

  /**
   * Publish generic HTTP Error event (for all HTTP errors)
   */
  publishHttpError(payload: HttpErrorPayload): void {
    this.pubSubService.publish('http:error', payload, 'http');
  }

  /**
   * Subscribe to all HTTP Error events
   */
  onHttpError(config?: SubscriptionConfig): Observable<EventPayload<HttpErrorPayload>> {
    return this.pubSubService.subscribe<HttpErrorPayload>('http:error', config);
  }

  // Generic methods for custom events

  /**
   * Publish a custom event
   */
  publishCustomEvent<T = any>(eventType: string, payload: T, source?: string): void {
    this.pubSubService.publish(eventType, payload, source);
  }

  /**
   * Subscribe to a custom event
   */
  onCustomEvent<T = any>(eventType: string, config?: SubscriptionConfig): Observable<EventPayload<T>> {
    return this.pubSubService.subscribe<T>(eventType, config);
  }

  /**
   * Subscribe to multiple custom events
   */
  onCustomEvents<T = any>(eventTypes: string[], config?: SubscriptionConfig): Observable<EventPayload<T>> {
    return this.pubSubService.subscribeToMultiple<T>(eventTypes, config);
  }

  // Utility methods

  /**
   * Get debug information from the underlying pub-sub service
   */
  getDebugInfo() {
    return this.pubSubService.getDebugInfo();
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.pubSubService.setDebugMode(enabled);
  }

  /**
   * Check if there are subscribers for a specific event
   */
  hasSubscribers(eventType: string): boolean {
    return this.pubSubService.hasSubscribers(eventType);
  }

  /**
   * Get all active event types
   */
  getActiveEventTypes(): string[] {
    return this.pubSubService.getActiveEventTypes();
  }
}
