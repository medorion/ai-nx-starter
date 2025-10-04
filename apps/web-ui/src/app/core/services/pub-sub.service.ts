import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, EMPTY, merge } from 'rxjs';
import {
  filter,
  map,
  debounceTime,
  throttleTime,
  shareReplay,
  distinctUntilChanged,
  tap
} from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import {
  EventPayload,
  SubscriptionConfig,
  EventSubscription,
  IPubSubService
} from './pub-sub.types';

/**
 * Internal subscription tracker
 */
interface InternalSubscription {
  id: string;
  eventType: string;
  subject: Subject<EventPayload>;
  config: SubscriptionConfig;
}

/**
 * Event buffer for replay functionality
 */
interface EventBuffer {
  events: EventPayload[];
  maxSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class PubSubService implements IPubSubService, OnDestroy {
  private readonly eventSubjects = new Map<string, Subject<EventPayload>>();
  private readonly eventBuffers = new Map<string, EventBuffer>();
  private readonly allEventsSubject = new Subject<EventPayload>();
  private readonly subscriptions = new Map<string, InternalSubscription>();

  // For debugging purposes
  private readonly debugMode = false;
  private readonly eventHistory: EventPayload[] = [];
  private readonly maxHistorySize = 1000;

  constructor() {
    if (this.debugMode) {
      console.log('[PubSubService] Initialized');
    }
  }

  /**
   * Publish an event to all subscribers
   */
  publish<T = any>(eventType: string, payload: T, source?: string): void {
    const event: EventPayload<T> = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      source,
      correlationId: uuidv4()
    };

    // Add to history for debugging
    this.addToHistory(event);

    // Log in debug mode
    if (this.debugMode) {
      console.log(`[PubSubService] Publishing event:`, event);
    }

    // Emit to specific event subscribers
    const eventSubject = this.eventSubjects.get(eventType);
    if (eventSubject && !eventSubject.closed) {
      eventSubject.next(event);
    }

    // Emit to all-events subscribers
    if (!this.allEventsSubject.closed) {
      this.allEventsSubject.next(event);
    }

    // Add to replay buffer
    this.addToBuffer(eventType, event);
  }

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T = any>(
    eventType: string,
    config: SubscriptionConfig = {}
  ): Observable<EventPayload<T>> {
    const subscriptionId = uuidv4();

    // Get or create subject for this event type
    let eventSubject = this.eventSubjects.get(eventType);
    if (!eventSubject) {
      eventSubject = new Subject<EventPayload>();
      this.eventSubjects.set(eventType, eventSubject);
    }

    // Create observable chain with configurations
    let observable = eventSubject.asObservable() as Observable<EventPayload<T>>;

    // Apply replay if requested
    if (config.replay) {
      const bufferedEvents = this.getBufferedEvents(eventType, config.bufferSize || 1);
      if (bufferedEvents.length > 0) {
        const replayObservable = new Observable<EventPayload<T>>(subscriber => {
          bufferedEvents.forEach(event => subscriber.next(event));
          subscriber.complete();
        });
        observable = merge(replayObservable, observable);
      }
    }

    // Apply filter if provided
    if (config.filter) {
      observable = observable.pipe(filter(config.filter));
    }

    // Apply debounce if specified
    if (config.debounceTime && config.debounceTime > 0) {
      observable = observable.pipe(debounceTime(config.debounceTime));
    }

    // Apply throttle if specified
    if (config.throttleTime && config.throttleTime > 0) {
      observable = observable.pipe(throttleTime(config.throttleTime));
    }

    // Share replay for multiple subscribers
    observable = observable.pipe(
      tap(event => {
        if (this.debugMode) {
          console.log(`[PubSubService] Event received by subscriber ${subscriptionId}:`, event);
        }
      }),
      shareReplay(1)
    );

    // Track subscription
    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      eventType,
      subject: eventSubject,
      config
    });

    // Return subscription handle
    const subscription: EventSubscription = {
      eventType,
      subscriptionId,
      unsubscribe: () => this.unsubscribe(subscriptionId)
    };

    if (this.debugMode) {
      console.log(`[PubSubService] Created subscription ${subscriptionId} for event type: ${eventType}`);
    }

    return observable;
  }

  /**
   * Subscribe to multiple event types
   */
  subscribeToMultiple<T = any>(
    eventTypes: string[],
    config: SubscriptionConfig = {}
  ): Observable<EventPayload<T>> {
    const observables = eventTypes.map(eventType =>
      this.subscribe<T>(eventType, config)
    );

    return merge(...observables).pipe(
      distinctUntilChanged((a, b) => a.correlationId === b.correlationId)
    );
  }

  /**
   * Subscribe to all events (useful for debugging/logging)
   */
  subscribeToAll<T = any>(
    config: SubscriptionConfig = {}
  ): Observable<EventPayload<T>> {
    let observable = this.allEventsSubject.asObservable() as Observable<EventPayload<T>>;

    // Apply filter if provided
    if (config.filter) {
      observable = observable.pipe(filter(config.filter));
    }

    // Apply debounce if specified
    if (config.debounceTime && config.debounceTime > 0) {
      observable = observable.pipe(debounceTime(config.debounceTime));
    }

    // Apply throttle if specified
    if (config.throttleTime && config.throttleTime > 0) {
      observable = observable.pipe(throttleTime(config.throttleTime));
    }

    return observable.pipe(shareReplay(1));
  }

  /**
   * Check if there are any subscribers for an event type
   */
  hasSubscribers(eventType: string): boolean {
    const subject = this.eventSubjects.get(eventType);
    return subject ? subject.observers.length > 0 : false;
  }

  /**
   * Get list of all active event types
   */
  getActiveEventTypes(): string[] {
    return Array.from(this.eventSubjects.keys()).filter(eventType =>
      this.hasSubscribers(eventType)
    );
  }

  /**
   * Clear all subscribers and replay buffers
   */
  clear(): void {
    // Complete all subjects
    this.eventSubjects.forEach(subject => {
      if (!subject.closed) {
        subject.complete();
      }
    });

    // Clear collections
    this.eventSubjects.clear();
    this.eventBuffers.clear();
    this.subscriptions.clear();
    this.eventHistory.length = 0;

    if (this.debugMode) {
      console.log('[PubSubService] Cleared all subscriptions and buffers');
    }
  }

  /**
   * Get the last emitted event for a specific type
   */
  getLastEvent<T = any>(eventType: string): EventPayload<T> | null {
    const buffer = this.eventBuffers.get(eventType);
    if (buffer && buffer.events.length > 0) {
      return buffer.events[buffer.events.length - 1] as EventPayload<T>;
    }
    return null;
  }

  /**
   * Get debug information (useful for development)
   */
  getDebugInfo() {
    return {
      activeEventTypes: this.getActiveEventTypes(),
      totalSubscriptions: this.subscriptions.size,
      eventHistory: this.eventHistory.slice(-10), // Last 10 events
      buffers: Array.from(this.eventBuffers.entries()).map(([type, buffer]) => ({
        type,
        eventCount: buffer.events.length,
        maxSize: buffer.maxSize
      }))
    };
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    (this as any).debugMode = enabled;
    console.log(`[PubSubService] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  ngOnDestroy(): void {
    this.clear();
    if (!this.allEventsSubject.closed) {
      this.allEventsSubject.complete();
    }
  }

  // Private helper methods

  private unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      this.subscriptions.delete(subscriptionId);

      if (this.debugMode) {
        console.log(`[PubSubService] Unsubscribed ${subscriptionId}`);
      }
    }
  }

  private addToBuffer(eventType: string, event: EventPayload): void {
    let buffer = this.eventBuffers.get(eventType);
    if (!buffer) {
      buffer = { events: [], maxSize: 1 };
      this.eventBuffers.set(eventType, buffer);
    }

    buffer.events.push(event);

    // Maintain buffer size
    if (buffer.events.length > buffer.maxSize) {
      buffer.events = buffer.events.slice(-buffer.maxSize);
    }
  }

  private getBufferedEvents(eventType: string, bufferSize: number): EventPayload[] {
    const buffer = this.eventBuffers.get(eventType);
    if (!buffer) {
      return [];
    }

    // Update buffer size if needed
    if (bufferSize > buffer.maxSize) {
      buffer.maxSize = bufferSize;
    }

    return buffer.events.slice(-bufferSize);
  }

  private addToHistory(event: EventPayload): void {
    this.eventHistory.push(event);

    // Maintain history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.splice(0, this.eventHistory.length - this.maxHistorySize);
    }
  }
}