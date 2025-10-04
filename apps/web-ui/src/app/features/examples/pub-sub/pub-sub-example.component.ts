import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EventBusService } from '../../../core/services/event-bus.service';
import { PubSubService } from '../../../core/services/pub-sub.service';
import { NotificationPayload } from '../../../core/services/pub-sub.types';
import { LoggerService } from '../../../core/services/logger.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Example component demonstrating pub-sub usage
 * This component shows how to:
 * 1. Subscribe to events
 * 2. Publish events
 * 3. Handle subscription cleanup
 * 4. Use both generic and typed event methods
 */
@Component({
  selector: 'app-pub-sub-example',
  templateUrl: './pub-sub-example.component.html',
  styleUrls: ['./pub-sub-example.component.less'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PubSubExampleComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public recentEvents: any[] = [];
  public debugInfo: any = {};
  public currentTheme: 'light' | 'dark' = 'light';

  // Code examples for the template
  public basicPublishExample = `// Publishing events
this.eventBus.publishNotification({
  id: 'success-1',
  type: 'success',
  title: 'Success!',
  message: 'Operation completed successfully'
});

this.eventBus.publishThemeChanged({
  theme: 'dark',
  previousTheme: 'light'
});`;

  public subscriptionExample = `// Subscribing to events
this.eventBus.onNotification().subscribe(event => {
  console.log('Notification:', event.payload.message);
});

this.eventBus.onThemeChanged().subscribe(event => {
  document.body.className = event.payload.theme;
});`;

  public customEventExample = `// Custom events
this.eventBus.publishCustomEvent('my:custom-event', {
  data: 'custom data',
  timestamp: Date.now()
});

this.eventBus.onCustomEvent('my:custom-event').subscribe(event => {
  console.log('Custom event received:', event.payload);
});`;

  constructor(
    private eventBus: EventBusService,
    private pubSub: PubSubService,
    private logger: LoggerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.subscribeToEvents();
    this.updateDebugInfo();
    this.getCurrentTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToEvents(): void {
    // Subscribe to all events for demonstration
    this.pubSub.subscribeToAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.recentEvents.unshift(event);
        if (this.recentEvents.length > 10) {
          this.recentEvents.pop();
        }
        this.updateDebugInfo();
      });

    // Subscribe to specific typed events
    this.eventBus.onNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.logger.info('📢 Notification received:', event.payload);
        // Here you would typically show the notification in your UI
        this.showNotificationInConsole(event.payload);
      });

    this.eventBus.onThemeChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.logger.info('🎨 Theme changed:', event.payload);
        // Here you would apply the theme
        this.applyTheme(event.payload.theme);
      });

    this.eventBus.onUserLoggedIn()
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.logger.info('👤 User logged in:', event.payload);
        // Here you would update the user state
      });

    // Custom event subscription
    this.eventBus.onCustomEvent('demo:custom-event')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.logger.info('🔧 Custom event received:', event.payload);
      });
  }

  // Event Publishers

  publishNotification(): void {
    const notification: NotificationPayload = {
      id: `notification-${Date.now()}`,
      type: 'success',
      title: 'Demo Notification',
      message: 'This is a demonstration notification from the pub-sub system!',
      duration: 5000,
      action: {
        label: 'Dismiss',
        handler: () => console.log('Notification dismissed')
      }
    };

    this.eventBus.publishNotification(notification);
  }

  publishThemeChange(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';

    this.eventBus.publishThemeChanged({
      theme: newTheme,
      previousTheme: this.currentTheme
    });
  }

  publishUserLogin(): void {
    this.eventBus.publishUserLoggedIn({
      userId: `user-${Math.random().toString(36).substr(2, 9)}`,
      email: 'demo@example.com',
      roles: ['user', 'demo'],
      token: 'demo-jwt-token'
    });
  }

  publishCustomEvent(): void {
    this.eventBus.publishCustomEvent('demo:custom-event', {
      message: 'This is a custom event',
      timestamp: new Date().toISOString(),
      randomData: Math.random(),
      metadata: {
        source: 'PubSubExampleComponent',
        version: '1.0.0'
      }
    });
  }

  publishDataUpdate(): void {
    this.eventBus.publishDataUpdated({
      entityType: 'demo-item',
      data: { id: Math.random(), name: 'Demo Item', value: Math.random() * 100 },
      operation: 'update',
      id: `demo-${Date.now()}`
    });
  }

  publishFormEvent(): void {
    this.eventBus.publishFormSubmitted({
      formId: 'demo-form',
      formData: {
        name: 'Demo User',
        email: 'demo@example.com',
        preferences: ['notifications', 'themes']
      }
    });
  }

  clearEvents(): void {
    this.recentEvents = [];
    this.updateDebugInfo();
  }

  toggleDebugMode(): void {
    const currentMode = this.debugInfo.debugMode || false;
    this.eventBus.setDebugMode(!currentMode);
    this.updateDebugInfo();
  }

  // Helper Methods

  private updateDebugInfo(): void {
    this.debugInfo = {
      ...this.eventBus.getDebugInfo(),
      debugMode: false // This would come from the service if exposed
    };
  }

  private getCurrentTheme(): void {
    this.currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  }

  private showNotificationInConsole(notification: NotificationPayload): void {
    this.messageService.success(`${notification.title}: ${notification.message}`);
    if (notification.action) {
      this.logger.info(`Action available: ${notification.action.label}`);
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    // Remove existing theme classes
    document.body.classList.remove('light-theme', 'dark-theme');
    // Add new theme class
    document.body.classList.add(`${theme}-theme`);
    this.currentTheme = theme;
    this.logger.info(`Applied ${theme} theme`);
  }

  // Template helper methods
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  trackByCorrelationId(index: number, event: any): string {
    return event.correlationId || index;
  }
}