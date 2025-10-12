import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ApiExceptionsService } from '@ai-nx-starter/api-client';
import { LoggerService } from '../../../core/services/logger.service';

/**
 * Example component demonstrating exception testing
 * This component provides buttons to trigger different types of exceptions
 * from the backend and demonstrates how they are handled by the error system
 */
@Component({
  selector: 'app-exceptions-example',
  templateUrl: './exceptions-example.component.html',
  styleUrls: ['./exceptions-example.component.less'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExceptionsExampleComponent implements OnInit {
  public endpoints: any[] = [];

  // Pre-computed mappings to avoid function calls in template
  public buttonTypeMap = new Map<number, 'primary' | 'default' | 'dashed' | 'text' | 'link'>([
    [455, 'primary'], // Session Expired
    [456, 'default'], // App Warning
    [457, 'primary'], // Concurrency Error
    [458, 'primary'], // Unauthorized Login
    [459, 'primary'], // App Error
  ]);

  public iconMap = new Map<number, string>([
    [455, 'clock-circle'], // Session Expired
    [456, 'warning'], // App Warning
    [457, 'sync'], // Concurrency Error
    [458, 'lock'], // Unauthorized Login
    [459, 'close-circle'], // App Error
  ]);

  constructor(
    private apiExceptionsService: ApiExceptionsService,
    private logger: LoggerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadEndpoints();
  }

  /**
   * Load available exception endpoints for display
   */
  private loadEndpoints(): void {
    this.apiExceptionsService.getExceptionEndpoints().subscribe({
      next: (response) => {
        // Process endpoints and add computed properties
        this.endpoints = response.endpoints.map((endpoint) => ({
          ...endpoint,
          displayName: endpoint.exception.replace('Exception', ''),
          buttonType: this.buttonTypeMap.get(endpoint.statusCode) || 'default',
          iconType: this.iconMap.get(endpoint.statusCode) || 'question-circle',
        }));
        this.logger.info('Loaded exception endpoints:', response);
        // Trigger change detection since we're using OnPush strategy
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.logger.error('Failed to load endpoints:', error);
        // MessageService will automatically handle HTTP errors via event bus
      },
    });
  }

  /**
   * Trigger Session Expired exception (455)
   */
  triggerSessionExpired(): void {
    this.logger.info('🔴 Triggering Session Expired exception...');

    this.apiExceptionsService.triggerSessionExpired().subscribe({
      next: () => {
        // This should never execute since the endpoint throws an exception
        this.logger.info('Unexpected success response');
      },
      error: (error) => {
        this.logger.info('✅ Session Expired exception caught:', error);
        // MessageService will automatically handle the error via event bus
      },
    });
  }

  /**
   * Trigger App Warning exception (456)
   */
  triggerAppWarning(): void {
    this.logger.info('🟡 Triggering App Warning exception...');

    this.apiExceptionsService.triggerAppWarning().subscribe({
      next: () => {
        this.logger.info('Unexpected success response');
      },
      error: (error) => {
        this.logger.info('✅ App Warning exception caught:', error);
        // MessageService will automatically handle the error via event bus
      },
    });
  }

  /**
   * Trigger Concurrency Error exception (457)
   */
  triggerConcurrencyError(): void {
    this.logger.info('🔶 Triggering Concurrency Error exception...');

    this.apiExceptionsService.triggerConcurrencyError().subscribe({
      next: () => {
        this.logger.info('Unexpected success response');
      },
      error: (error) => {
        this.logger.info('✅ Concurrency Error exception caught:', error);
        // MessageService will automatically handle the error via event bus
      },
    });
  }

  /**
   * Trigger Unauthorized Login exception (458)
   */
  triggerUnauthorizedLogin(): void {
    this.logger.info('🔴 Triggering Unauthorized Login exception...');

    this.apiExceptionsService.triggerUnauthorizedLogin().subscribe({
      next: () => {
        this.logger.info('Unexpected success response');
      },
      error: (error) => {
        this.logger.info('✅ Unauthorized Login exception caught:', error);
        // MessageService will automatically handle the error via event bus
      },
    });
  }

  /**
   * Trigger App Error exception (459)
   */
  triggerAppError(): void {
    this.logger.info('🔴 Triggering App Error exception...');

    this.apiExceptionsService.triggerAppError().subscribe({
      next: () => {
        this.logger.info('Unexpected success response');
      },
      error: (error) => {
        this.logger.info('✅ App Error exception caught:', error);
        // MessageService will automatically handle the error via event bus
      },
    });
  }

  /**
   * Trigger specific exception by status code
   */
  triggerException(statusCode: number): void {
    switch (statusCode) {
      case 455:
        this.triggerSessionExpired();
        break;
      case 456:
        this.triggerAppWarning();
        break;
      case 457:
        this.triggerConcurrencyError();
        break;
      case 458:
        this.triggerUnauthorizedLogin();
        break;
      case 459:
        this.triggerAppError();
        break;
      default:
        this.logger.warn('Unknown exception type:', statusCode);
    }
  }

  /**
   * TrackBy function for ngFor performance
   */
  trackByStatusCode(index: number, endpoint: any): number {
    return endpoint.statusCode;
  }
}
