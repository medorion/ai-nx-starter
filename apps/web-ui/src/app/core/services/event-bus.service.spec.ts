import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EventBusService } from './event-bus.service';
import { PubSubService } from './pub-sub.service';
import { CommonEvents } from './pub-sub.types';

describe('EventBusService', () => {
  let service: EventBusService;
  let pubSubService: jest.Mocked<PubSubService>;

  beforeEach(() => {
    const mockPubSubService = {
      publish: jest.fn(),
      subscribe: jest.fn().mockReturnValue(of({ type: 'test', payload: {}, timestamp: Date.now() })),
      subscribeToMultiple: jest.fn().mockReturnValue(of({ type: 'test', payload: {}, timestamp: Date.now() })),
      getDebugInfo: jest.fn().mockReturnValue({ activeEventTypes: [], totalSubscriptions: 0, eventHistory: [], buffers: [] }),
      setDebugMode: jest.fn(),
      hasSubscribers: jest.fn().mockReturnValue(false),
      getActiveEventTypes: jest.fn().mockReturnValue([]),
    };

    TestBed.configureTestingModule({
      providers: [EventBusService, { provide: PubSubService, useValue: mockPubSubService }],
    });

    service = TestBed.inject(EventBusService);
    pubSubService = TestBed.inject(PubSubService) as jest.Mocked<PubSubService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should create service', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Authentication Events', () => {
    it('should publish user logged in event', () => {
      const payload = { userId: 'user123', email: 'test@example.com', roles: ['admin'], token: 'test-token' };

      service.publishUserLoggedIn(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.USER_LOGGED_IN, payload, 'auth');
    });

    it('should subscribe to user logged in event', (done) => {
      const payload = { userId: 'user123', email: 'test@example.com', roles: ['admin'], token: 'test-token' };
      pubSubService.subscribe.mockReturnValue(of({ type: CommonEvents.USER_LOGGED_IN, payload, timestamp: Date.now() }));

      service.onUserLoggedIn().subscribe((event) => {
        expect(event.payload).toEqual(payload);
        expect(pubSubService.subscribe).toHaveBeenCalledWith(CommonEvents.USER_LOGGED_IN, undefined);
        done();
      });
    });

    it('should publish user logged out event', () => {
      service.publishUserLoggedOut();

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.USER_LOGGED_OUT, null, 'auth');
    });

    it('should subscribe to user logged out event', (done) => {
      pubSubService.subscribe.mockReturnValue(of({ type: CommonEvents.USER_LOGGED_OUT, payload: null, timestamp: Date.now() }));

      service.onUserLoggedOut().subscribe((event) => {
        expect(event.payload).toBeNull();
        done();
      });
    });

    it('should publish session expired event', () => {
      service.publishSessionExpired();

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.USER_SESSION_EXPIRED, null, 'auth');
    });

    it('should subscribe to session expired event', (done) => {
      service.onSessionExpired().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith(CommonEvents.USER_SESSION_EXPIRED, undefined);
        done();
      });
    });
  });

  describe('Navigation Events', () => {
    it('should publish route changed event', () => {
      const payload = { from: '/home', to: '/dashboard', params: {} };

      service.publishRouteChanged(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.ROUTE_CHANGED, payload, 'router');
    });

    it('should subscribe to route changed event', (done) => {
      const config = { replay: true, bufferSize: 1 };

      service.onRouteChanged(config).subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith(CommonEvents.ROUTE_CHANGED, config);
        done();
      });
    });

    it('should publish page loaded event', () => {
      service.publishPageLoaded('/dashboard');

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.PAGE_LOADED, { url: '/dashboard' }, 'navigation');
    });

    it('should subscribe to page loaded event', (done) => {
      service.onPageLoaded().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith(CommonEvents.PAGE_LOADED, undefined);
        done();
      });
    });
  });

  describe('UI State Events', () => {
    it('should publish theme changed event', () => {
      const payload = { theme: 'dark' as const, previousTheme: 'light' as const };

      service.publishThemeChanged(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.THEME_CHANGED, payload, 'ui');
    });

    it('should subscribe to theme changed event', (done) => {
      service.onThemeChanged().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith(CommonEvents.THEME_CHANGED, undefined);
        done();
      });
    });

    it('should publish sidebar toggled event', () => {
      service.publishSidebarToggled(true);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.SIDEBAR_TOGGLED, { isOpen: true }, 'ui');
    });

    it('should subscribe to sidebar toggled event', (done) => {
      service.onSidebarToggled().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });

    it('should publish modal opened event', () => {
      const data = { userId: '123' };

      service.publishModalOpened('user-modal', data);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.MODAL_OPENED, { modalId: 'user-modal', data }, 'ui');
    });

    it('should publish modal opened event without data', () => {
      service.publishModalOpened('confirm-modal');

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.MODAL_OPENED, { modalId: 'confirm-modal', data: undefined }, 'ui');
    });

    it('should subscribe to modal opened event', (done) => {
      service.onModalOpened().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });

    it('should publish modal closed event', () => {
      const result = { confirmed: true };

      service.publishModalClosed('confirm-modal', result);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.MODAL_CLOSED, { modalId: 'confirm-modal', result }, 'ui');
    });

    it('should subscribe to modal closed event', (done) => {
      service.onModalClosed().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Data Events', () => {
    it('should publish data loaded event', () => {
      const payload = { entityType: 'user', data: { id: '123' }, operation: 'create' as const };

      service.publishDataLoaded(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.DATA_LOADED, payload, 'data');
    });

    it('should subscribe to data loaded event', (done) => {
      service.onDataLoaded().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith(CommonEvents.DATA_LOADED, undefined);
        done();
      });
    });

    it('should publish data updated event', () => {
      const payload = { entityType: 'user', data: { id: '123', name: 'Updated' }, operation: 'update' as const };

      service.publishDataUpdated(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.DATA_UPDATED, payload, 'data');
    });

    it('should subscribe to data updated event', (done) => {
      service.onDataUpdated().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });

    it('should publish data deleted event', () => {
      const payload = { entityType: 'user', data: { id: '123' }, operation: 'delete' as const };

      service.publishDataDeleted(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.DATA_DELETED, payload, 'data');
    });

    it('should subscribe to data deleted event', (done) => {
      service.onDataDeleted().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });

    it('should publish data error event', () => {
      const error = { message: 'Failed to load data', code: 'DATA_ERROR', details: { id: '123' } };

      service.publishDataError(error);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.DATA_ERROR, error, 'data');
    });

    it('should subscribe to data error event', (done) => {
      service.onDataError().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Notification Events', () => {
    it('should publish notification event', () => {
      const payload = { id: 'notif-1', type: 'success' as const, title: 'Success', message: 'Operation successful', duration: 3000 };

      service.publishNotification(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.NOTIFICATION_SHOW, payload, 'notification');
    });

    it('should subscribe to notification event', (done) => {
      service.onNotification().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });

    it('should publish notification hide event', () => {
      service.publishNotificationHide('notif-123');

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.NOTIFICATION_HIDE, { id: 'notif-123' }, 'notification');
    });

    it('should subscribe to notification hide event', (done) => {
      service.onNotificationHide().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Form Events', () => {
    it('should publish form submitted event', () => {
      const payload = { formId: 'user-form', formData: { name: 'Test' } };

      service.publishFormSubmitted(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.FORM_SUBMITTED, payload, 'form');
    });

    it('should subscribe to form submitted event', (done) => {
      service.onFormSubmitted().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });

    it('should publish form reset event', () => {
      service.publishFormReset('user-form');

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.FORM_RESET, { formId: 'user-form' }, 'form');
    });

    it('should subscribe to form reset event', (done) => {
      service.onFormReset().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });

    it('should publish form validation error event', () => {
      const payload = { formId: 'user-form', formData: {}, errors: { name: ['required'] } };

      service.publishFormValidationError(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.FORM_VALIDATION_ERROR, payload, 'form');
    });

    it('should subscribe to form validation error event', (done) => {
      service.onFormValidationError().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Network Events', () => {
    it('should publish network online event', () => {
      service.publishNetworkOnline();

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.NETWORK_ONLINE, null, 'network');
    });

    it('should subscribe to network online event', (done) => {
      service.onNetworkOnline().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });

    it('should publish network offline event', () => {
      service.publishNetworkOffline();

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.NETWORK_OFFLINE, null, 'network');
    });

    it('should subscribe to network offline event', (done) => {
      service.onNetworkOffline().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Application Events', () => {
    it('should publish app initialized event', () => {
      const config = { version: '1.0.0', env: 'production' };

      service.publishAppInitialized(config);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.APP_INITIALIZED, config, 'app');
    });

    it('should subscribe to app initialized event', (done) => {
      service.onAppInitialized().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });

    it('should publish config loaded event', () => {
      const config = { apiUrl: 'http://localhost:3000', timeout: 5000 };

      service.publishConfigLoaded(config);

      expect(pubSubService.publish).toHaveBeenCalledWith(CommonEvents.CONFIG_LOADED, config, 'app');
    });

    it('should subscribe to config loaded event', (done) => {
      service.onConfigLoaded().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('HTTP Error Events', () => {
    it('should publish session expired HTTP event', () => {
      const payload = {
        status: 440,
        message: 'Session expired',
        type: 'SessionExpired' as const,
        userMessage: 'Please log in again',
        url: '/api/data',
        method: 'GET',
        timestamp: Date.now(),
        error: {},
      };

      service.publishSessionExpiredHttp(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith('http:session-expired', payload, 'http');
    });

    it('should subscribe to session expired HTTP event', (done) => {
      service.onSessionExpiredHttp().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith('http:session-expired', undefined);
        done();
      });
    });

    it('should publish app error HTTP event', () => {
      const payload = {
        status: 460,
        message: 'Application error',
        type: 'AppError' as const,
        userMessage: 'An error occurred',
        url: '/api/data',
        method: 'POST',
        timestamp: Date.now(),
        error: {},
      };

      service.publishAppErrorHttp(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith('http:app-error', payload, 'http');
    });

    it('should subscribe to app error HTTP event', (done) => {
      service.onAppErrorHttp().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith('http:app-error', undefined);
        done();
      });
    });

    it('should publish app warning HTTP event', () => {
      const payload = {
        status: 455,
        message: 'Warning',
        type: 'AppWarning' as const,
        userMessage: 'Please check your input',
        url: '/api/validate',
        method: 'POST',
        timestamp: Date.now(),
        error: {},
      };

      service.publishAppWarningHttp(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith('http:app-warning', payload, 'http');
    });

    it('should subscribe to app warning HTTP event', (done) => {
      service.onAppWarningHttp().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith('http:app-warning', undefined);
        done();
      });
    });

    it('should publish concurrency exception HTTP event', () => {
      const payload = {
        status: 450,
        message: 'Concurrency error',
        type: 'ConcurrencyException' as const,
        userMessage: 'Data was modified by another user',
        url: '/api/update',
        method: 'PUT',
        timestamp: Date.now(),
        error: {},
      };

      service.publishConcurrencyExceptionHttp(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith('http:concurrency-exception', payload, 'http');
    });

    it('should subscribe to concurrency exception HTTP event', (done) => {
      service.onConcurrencyExceptionHttp().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith('http:concurrency-exception', undefined);
        done();
      });
    });

    it('should publish unauthorized HTTP event', () => {
      const payload = {
        status: 401,
        message: 'Unauthorized',
        type: 'Unauthorized' as const,
        userMessage: 'Invalid credentials',
        url: '/api/login',
        method: 'POST',
        timestamp: Date.now(),
        error: {},
      };

      service.publishUnauthorizedHttp(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith('http:unauthorized', payload, 'http');
    });

    it('should subscribe to unauthorized HTTP event', (done) => {
      service.onUnauthorizedHttp().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith('http:unauthorized', undefined);
        done();
      });
    });

    it('should publish forbidden HTTP event', () => {
      const payload = {
        status: 403,
        message: 'Forbidden',
        type: 'Forbidden' as const,
        userMessage: 'Access denied',
        url: '/api/admin',
        method: 'GET',
        timestamp: Date.now(),
        error: {},
      };

      service.publishForbiddenHttp(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith('http:forbidden', payload, 'http');
    });

    it('should subscribe to forbidden HTTP event', (done) => {
      service.onForbiddenHttp().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith('http:forbidden', undefined);
        done();
      });
    });

    it('should publish generic HTTP error event', () => {
      const payload = {
        status: 500,
        message: 'Internal server error',
        type: 'HttpError',
        userMessage: 'Server error',
        url: '/api/data',
        method: 'GET',
        timestamp: Date.now(),
        error: {},
      };

      service.publishHttpError(payload);

      expect(pubSubService.publish).toHaveBeenCalledWith('http:error', payload, 'http');
    });

    it('should subscribe to generic HTTP error event', (done) => {
      service.onHttpError().subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith('http:error', undefined);
        done();
      });
    });
  });

  describe('Custom Events', () => {
    it('should publish custom event', () => {
      const payload = { customData: 'test' };

      service.publishCustomEvent('custom:event', payload, 'custom-source');

      expect(pubSubService.publish).toHaveBeenCalledWith('custom:event', payload, 'custom-source');
    });

    it('should publish custom event without source', () => {
      const payload = { customData: 'test' };

      service.publishCustomEvent('custom:event', payload);

      expect(pubSubService.publish).toHaveBeenCalledWith('custom:event', payload, undefined);
    });

    it('should subscribe to custom event', (done) => {
      const config = { replay: true, bufferSize: 2 };

      service.onCustomEvent('custom:event', config).subscribe(() => {
        expect(pubSubService.subscribe).toHaveBeenCalledWith('custom:event', config);
        done();
      });
    });

    it('should subscribe to multiple custom events', (done) => {
      const eventTypes = ['event1', 'event2', 'event3'];
      const config = { replay: false, debounceTime: 300 };

      service.onCustomEvents(eventTypes, config).subscribe(() => {
        expect(pubSubService.subscribeToMultiple).toHaveBeenCalledWith(eventTypes, config);
        done();
      });
    });
  });

  describe('Utility Methods', () => {
    it('should get debug info', () => {
      const debugInfo = {
        activeEventTypes: ['event1'],
        totalSubscriptions: 42,
        eventHistory: [],
        buffers: [],
      };
      pubSubService.getDebugInfo.mockReturnValue(debugInfo);

      const result = service.getDebugInfo();

      expect(result).toEqual(debugInfo);
      expect(pubSubService.getDebugInfo).toHaveBeenCalled();
    });

    it('should set debug mode to true', () => {
      service.setDebugMode(true);

      expect(pubSubService.setDebugMode).toHaveBeenCalledWith(true);
    });

    it('should set debug mode to false', () => {
      service.setDebugMode(false);

      expect(pubSubService.setDebugMode).toHaveBeenCalledWith(false);
    });

    it('should check if event has subscribers', () => {
      pubSubService.hasSubscribers.mockReturnValue(true);

      const result = service.hasSubscribers('test:event');

      expect(result).toBe(true);
      expect(pubSubService.hasSubscribers).toHaveBeenCalledWith('test:event');
    });

    it('should return false when event has no subscribers', () => {
      pubSubService.hasSubscribers.mockReturnValue(false);

      const result = service.hasSubscribers('nonexistent:event');

      expect(result).toBe(false);
    });

    it('should get active event types', () => {
      const eventTypes = ['event1', 'event2', 'event3'];
      pubSubService.getActiveEventTypes.mockReturnValue(eventTypes);

      const result = service.getActiveEventTypes();

      expect(result).toEqual(eventTypes);
      expect(pubSubService.getActiveEventTypes).toHaveBeenCalled();
    });

    it('should return empty array when no active event types', () => {
      pubSubService.getActiveEventTypes.mockReturnValue([]);

      const result = service.getActiveEventTypes();

      expect(result).toEqual([]);
    });
  });
});
