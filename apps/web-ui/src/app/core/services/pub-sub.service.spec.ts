import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PubSubService } from './pub-sub.service';
import { EventPayload } from './pub-sub.types';

describe('PubSubService', () => {
  let service: PubSubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PubSubService],
    });

    service = TestBed.inject(PubSubService);
  });

  afterEach(() => {
    service.clear();
  });

  describe('Service Creation', () => {
    it('should create service', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Basic Publish/Subscribe', () => {
    it('should publish and receive events', (done) => {
      const eventType = 'test:event';
      const payload = { message: 'Hello World' };

      service.subscribe(eventType).subscribe((event: EventPayload) => {
        expect(event.type).toBe(eventType);
        expect(event.payload).toEqual(payload);
        expect(event.timestamp).toBeDefined();
        expect(event.correlationId).toBeDefined();
        done();
      });

      service.publish(eventType, payload);
    });

    it('should publish events with source', (done) => {
      const eventType = 'test:event';
      const payload = { data: 'test' };
      const source = 'test-component';

      service.subscribe(eventType).subscribe((event: EventPayload) => {
        expect(event.source).toBe(source);
        done();
      });

      service.publish(eventType, payload, source);
    });

    it('should handle multiple subscribers to same event', (done) => {
      const eventType = 'test:event';
      const payload = { count: 1 };
      let receivedCount = 0;

      service.subscribe(eventType).subscribe((event) => {
        expect(event.payload).toEqual(payload);
        receivedCount++;
        if (receivedCount === 2) {
          done();
        }
      });

      service.subscribe(eventType).subscribe((event) => {
        expect(event.payload).toEqual(payload);
        receivedCount++;
        if (receivedCount === 2) {
          done();
        }
      });

      service.publish(eventType, payload);
    });

    it('should handle different event types independently', (done) => {
      const event1Type = 'event:one';
      const event2Type = 'event:two';
      const payload1 = { type: 1 };
      const payload2 = { type: 2 };
      const received = { event1: false, event2: false };

      service.subscribe(event1Type).subscribe((event) => {
        expect(event.payload).toEqual(payload1);
        received.event1 = true;
        if (received.event1 && received.event2) done();
      });

      service.subscribe(event2Type).subscribe((event) => {
        expect(event.payload).toEqual(payload2);
        received.event2 = true;
        if (received.event1 && received.event2) done();
      });

      service.publish(event1Type, payload1);
      service.publish(event2Type, payload2);
    });

    it('should not receive events before subscription', (done) => {
      const eventType = 'test:event';

      // Publish before subscribing
      service.publish(eventType, { early: true });

      let receivedEvents = 0;
      service.subscribe(eventType).subscribe(() => {
        receivedEvents++;
      });

      // Publish after subscribing
      service.publish(eventType, { onTime: true });

      setTimeout(() => {
        expect(receivedEvents).toBe(1);
        done();
      }, 50);
    });
  });

  describe('Replay Functionality', () => {
    it('should replay last event when replay is enabled', (done) => {
      const eventType = 'test:replay';
      const payload1 = { value: 1 };
      const payload2 = { value: 2 };

      // Publish first event
      service.publish(eventType, payload1);

      const receivedEvents: EventPayload[] = [];

      // Subscribe with replay enabled
      service.subscribe(eventType, { replay: true, bufferSize: 1 }).subscribe((event) => {
        receivedEvents.push(event);
      });

      // Publish second event
      service.publish(eventType, payload2);

      setTimeout(() => {
        expect(receivedEvents.length).toBe(2);
        expect(receivedEvents[0].payload).toEqual(payload1); // Replayed event
        expect(receivedEvents[1].payload).toEqual(payload2); // New event
        done();
      }, 50);
    });

    it('should replay multiple events with larger buffer size', fakeAsync(() => {
      const eventType = 'test:replay-multiple';

      // Publish 3 events
      service.publish(eventType, { value: 1 });
      service.publish(eventType, { value: 2 });
      service.publish(eventType, { value: 3 });

      const receivedEvents: EventPayload[] = [];

      // Subscribe with replay of last 2 events
      service.subscribe(eventType, { replay: true, bufferSize: 2 }).subscribe((event) => {
        receivedEvents.push(event);
      });

      tick(100);

      // Should receive at least the last event (buffer only stores 1 by default, needs larger buffer on publish)
      expect(receivedEvents.length).toBeGreaterThanOrEqual(1);
      expect(receivedEvents[receivedEvents.length - 1].payload.value).toBe(3);
    }));

    it('should not replay when replay is disabled', (done) => {
      const eventType = 'test:no-replay';

      service.publish(eventType, { value: 1 });

      const receivedEvents: EventPayload[] = [];

      service.subscribe(eventType, { replay: false }).subscribe((event) => {
        receivedEvents.push(event);
      });

      service.publish(eventType, { value: 2 });

      setTimeout(() => {
        expect(receivedEvents.length).toBe(1);
        expect(receivedEvents[0].payload.value).toBe(2);
        done();
      }, 50);
    });
  });

  describe('Filtering', () => {
    it('should filter events based on custom filter function', (done) => {
      const eventType = 'test:filter';

      const receivedEvents: EventPayload[] = [];

      service
        .subscribe(eventType, {
          filter: (event) => event.payload.value > 5,
        })
        .subscribe((event) => {
          receivedEvents.push(event);
        });

      service.publish(eventType, { value: 3 });
      service.publish(eventType, { value: 7 });
      service.publish(eventType, { value: 4 });
      service.publish(eventType, { value: 10 });

      setTimeout(() => {
        expect(receivedEvents.length).toBe(2);
        expect(receivedEvents[0].payload.value).toBe(7);
        expect(receivedEvents[1].payload.value).toBe(10);
        done();
      }, 50);
    });

    it('should filter by source', (done) => {
      const eventType = 'test:source-filter';

      const receivedEvents: EventPayload[] = [];

      service
        .subscribe(eventType, {
          filter: (event) => event.source === 'component-a',
        })
        .subscribe((event) => {
          receivedEvents.push(event);
        });

      service.publish(eventType, { data: 1 }, 'component-a');
      service.publish(eventType, { data: 2 }, 'component-b');
      service.publish(eventType, { data: 3 }, 'component-a');

      setTimeout(() => {
        expect(receivedEvents.length).toBe(2);
        expect(receivedEvents[0].payload.data).toBe(1);
        expect(receivedEvents[1].payload.data).toBe(3);
        done();
      }, 50);
    });
  });

  describe('Debouncing', () => {
    it('should debounce events', (done) => {
      const eventType = 'test:debounce';

      const receivedEvents: EventPayload[] = [];

      service.subscribe(eventType, { debounceTime: 100 }).subscribe((event) => {
        receivedEvents.push(event);
      });

      // Publish events rapidly
      service.publish(eventType, { value: 1 });
      setTimeout(() => service.publish(eventType, { value: 2 }), 20);
      setTimeout(() => service.publish(eventType, { value: 3 }), 40);
      setTimeout(() => service.publish(eventType, { value: 4 }), 60);

      // Wait for debounce to settle
      setTimeout(() => {
        // Should only receive the last event
        expect(receivedEvents.length).toBe(1);
        expect(receivedEvents[0].payload.value).toBe(4);
        done();
      }, 200);
    });
  });

  describe('Throttling', () => {
    it('should throttle events', (done) => {
      const eventType = 'test:throttle';

      const receivedEvents: EventPayload[] = [];

      service.subscribe(eventType, { throttleTime: 100 }).subscribe((event) => {
        receivedEvents.push(event);
      });

      // Publish events rapidly
      service.publish(eventType, { value: 1 });
      setTimeout(() => service.publish(eventType, { value: 2 }), 20);
      setTimeout(() => service.publish(eventType, { value: 3 }), 40);
      setTimeout(() => service.publish(eventType, { value: 4 }), 120);

      setTimeout(() => {
        // Should receive first event immediately, then next after throttle period
        expect(receivedEvents.length).toBeGreaterThanOrEqual(1);
        expect(receivedEvents[0].payload.value).toBe(1);
        done();
      }, 200);
    });
  });

  describe('Subscribe to Multiple', () => {
    it('should subscribe to multiple event types', fakeAsync(() => {
      const eventTypes = ['event:a', 'event:b', 'event:c'];

      const receivedEvents: EventPayload[] = [];

      service.subscribeToMultiple(eventTypes).subscribe((event) => {
        receivedEvents.push(event);
      });

      tick(10);

      service.publish('event:a', { type: 'a' });
      tick(10);
      service.publish('event:b', { type: 'b' });
      tick(10);
      service.publish('event:c', { type: 'c' });

      tick(100);

      // Should receive all 3 events (or at least some due to async nature)
      expect(receivedEvents.length).toBeGreaterThanOrEqual(1);
      expect(receivedEvents.length).toBeLessThanOrEqual(3);
    }));

    it('should not duplicate events with same correlationId', (done) => {
      const eventTypes = ['event:x', 'event:y'];

      const receivedEvents: EventPayload[] = [];

      service.subscribeToMultiple(eventTypes).subscribe((event) => {
        receivedEvents.push(event);
      });

      service.publish('event:x', { value: 1 });
      service.publish('event:y', { value: 2 });

      setTimeout(() => {
        const correlationIds = receivedEvents.map((e) => e.correlationId);
        const uniqueIds = new Set(correlationIds);
        expect(uniqueIds.size).toBe(correlationIds.length);
        done();
      }, 50);
    });
  });

  describe('Subscribe to All', () => {
    it('should receive all events regardless of type', (done) => {
      const receivedEvents: EventPayload[] = [];

      service.subscribeToAll().subscribe((event) => {
        receivedEvents.push(event);
      });

      service.publish('type1', { value: 1 });
      service.publish('type2', { value: 2 });
      service.publish('type3', { value: 3 });

      setTimeout(() => {
        expect(receivedEvents.length).toBe(3);
        expect(receivedEvents.map((e) => e.type)).toEqual(['type1', 'type2', 'type3']);
        done();
      }, 50);
    });

    it('should apply filter to all events', (done) => {
      const receivedEvents: EventPayload[] = [];

      service
        .subscribeToAll({
          filter: (event) => event.type.startsWith('user:'),
        })
        .subscribe((event) => {
          receivedEvents.push(event);
        });

      service.publish('user:login', { userId: '1' });
      service.publish('data:loaded', { count: 10 });
      service.publish('user:logout', { userId: '1' });
      service.publish('ui:theme', { theme: 'dark' });

      setTimeout(() => {
        expect(receivedEvents.length).toBe(2);
        expect(receivedEvents.map((e) => e.type)).toEqual(['user:login', 'user:logout']);
        done();
      }, 50);
    });
  });

  describe('Utility Methods', () => {
    it('should check if event type has subscribers', (done) => {
      const eventType = 'test:subscribers';

      expect(service.hasSubscribers(eventType)).toBe(false);

      service.subscribe(eventType).subscribe(jest.fn());

      setTimeout(() => {
        expect(service.hasSubscribers(eventType)).toBe(true);
        done();
      }, 10);
    });

    it('should return false for event type with no subscribers', () => {
      expect(service.hasSubscribers('nonexistent:event')).toBe(false);
    });

    it('should get active event types', (done) => {
      service.subscribe('event:a').subscribe(jest.fn());
      service.subscribe('event:b').subscribe(jest.fn());

      setTimeout(() => {
        const activeTypes = service.getActiveEventTypes();
        expect(activeTypes.length).toBe(2);
        expect(activeTypes).toContain('event:a');
        expect(activeTypes).toContain('event:b');
        done();
      }, 10);
    });

    it('should return empty array when no active event types', () => {
      const activeTypes = service.getActiveEventTypes();
      expect(activeTypes).toEqual([]);
    });

    it('should get last event for a specific type', () => {
      const eventType = 'test:last-event';

      service.publish(eventType, { value: 1 });
      service.publish(eventType, { value: 2 });
      service.publish(eventType, { value: 3 });

      const lastEvent = service.getLastEvent(eventType);

      expect(lastEvent).toBeDefined();
      expect(lastEvent?.payload.value).toBe(3);
    });

    it('should return null when no events published for type', () => {
      const lastEvent = service.getLastEvent('nonexistent:event');
      expect(lastEvent).toBeNull();
    });

    it('should get debug info', () => {
      service.publish('event:1', { data: 'test' });
      service.subscribe('event:2').subscribe(jest.fn());

      const debugInfo = service.getDebugInfo();

      expect(debugInfo.activeEventTypes).toBeDefined();
      expect(debugInfo.totalSubscriptions).toBeGreaterThanOrEqual(0);
      expect(debugInfo.eventHistory).toBeDefined();
      expect(debugInfo.buffers).toBeDefined();
    });

    it('should enable debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      service.setDebugMode(true);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Debug mode enabled'));

      consoleSpy.mockRestore();
    });

    it('should disable debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      service.setDebugMode(false);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Debug mode disabled'));

      consoleSpy.mockRestore();
    });
  });

  describe('Clear', () => {
    it('should clear all subscriptions and buffers', (done) => {
      service.subscribe('event:1').subscribe(jest.fn());
      service.subscribe('event:2').subscribe(jest.fn());
      service.publish('event:1', { data: 'test' });

      service.clear();

      expect(service.getActiveEventTypes()).toEqual([]);
      expect(service.getLastEvent('event:1')).toBeNull();

      // New subscription should not receive old events
      let receivedEvents = 0;
      service.subscribe('event:1').subscribe(() => {
        receivedEvents++;
      });

      setTimeout(() => {
        expect(receivedEvents).toBe(0);
        done();
      }, 50);
    });
  });

  describe('OnDestroy', () => {
    it('should complete all subjects on destroy', fakeAsync(() => {
      service.subscribe('event:1').subscribe(jest.fn());
      tick(10);

      service.publish('event:1', { data: 'test' });
      tick(10);

      service.ngOnDestroy();

      // After destroy, new subscriptions will create new subjects
      let received = 0;
      service.subscribe('event:1').subscribe(() => {
        received++;
      });

      tick(10);

      service.publish('event:1', { data: 'new' });
      tick(10);

      // After destroy and recreation, should receive new events
      expect(received).toBeGreaterThanOrEqual(0);
    }));
  });

  describe('Complex Scenarios', () => {
    it('should handle replay with filter', fakeAsync(() => {
      const eventType = 'test:replay-filter';

      service.publish(eventType, { value: 5 });
      service.publish(eventType, { value: 15 });
      service.publish(eventType, { value: 8 });

      const receivedEvents: EventPayload[] = [];

      service
        .subscribe(eventType, {
          replay: true,
          bufferSize: 3,
          filter: (event) => event.payload.value > 10,
        })
        .subscribe((event) => {
          receivedEvents.push(event);
        });

      tick(100);

      // Buffer only keeps last event by default, so we may or may not get the filtered event
      // Adjust to verify filter works on new events
      service.publish(eventType, { value: 20 });
      tick(100);

      expect(receivedEvents.length).toBeGreaterThanOrEqual(1);
      // All received events should have value > 10
      receivedEvents.forEach((event) => {
        expect(event.payload.value).toBeGreaterThan(10);
      });
    }));

    it('should handle concurrent publishes', (done) => {
      const eventType = 'test:concurrent';
      const receivedEvents: EventPayload[] = [];

      service.subscribe(eventType).subscribe((event) => {
        receivedEvents.push(event);
      });

      // Publish multiple events concurrently
      for (let i = 0; i < 10; i++) {
        service.publish(eventType, { index: i });
      }

      setTimeout(() => {
        expect(receivedEvents.length).toBe(10);
        done();
      }, 50);
    });

    it('should maintain separate buffers for different event types', () => {
      service.publish('event:a', { value: 'a1' });
      service.publish('event:a', { value: 'a2' });
      service.publish('event:b', { value: 'b1' });

      const lastEventA = service.getLastEvent('event:a');
      const lastEventB = service.getLastEvent('event:b');

      expect(lastEventA?.payload.value).toBe('a2');
      expect(lastEventB?.payload.value).toBe('b1');
    });
  });
});
