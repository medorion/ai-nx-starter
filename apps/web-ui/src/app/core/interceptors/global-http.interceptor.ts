import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppConfigService } from '@medorion/api-client';
import { ErrorStatusCode } from '@medorion/types';
import { EventBusService } from '../services/event-bus.service';

/*
 * Global HTTP interceptor
 * Adds custom headers to all outgoing requests
 * Handles HTTP errors and publishes appropriate events via EventBus
 */
@Injectable()
export class GlobalHttpInterceptor implements HttpInterceptor {
  constructor(
    private readonly config: AppConfigService,
    private readonly eventBus: EventBusService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const config = this.config.getConfig();
    // Clone the request and add custom headers
    const modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'X-App-Version': config.version || '1.0.0',
        Authorization: `Bearer ${config.token}`,
        'X-Organization-Code': config.orgCode,
        'Md-Fp': `${config.fingerprint}`,
      },
    });

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleHttpError(error, req);
        return throwError(() => error);
      }),
    );
  }

  private handleHttpError(error: HttpErrorResponse, request: HttpRequest<any>): void {
    const baseErrorPayload = {
      status: error.status,
      message: error.message,
      url: request.url,
      method: request.method,
      timestamp: Date.now(),
      error: error.error,
    };

    // Handle specific ErrorStatusCode enum values - publish only one event per error
    switch (error.status) {
      case ErrorStatusCode.SessionExpired:
        this.eventBus.publishSessionExpiredHttp({
          ...baseErrorPayload,
          type: 'SessionExpired',
          userMessage: 'Your session has expired. Please log in again.',
        });
        break;

      case ErrorStatusCode.AppWarning:
        this.eventBus.publishAppWarningHttp({
          ...baseErrorPayload,
          type: 'AppWarning',
          userMessage: error.error?.message || 'A warning occurred while processing your request.',
        });
        break;

      case ErrorStatusCode.ConcurencyException:
        this.eventBus.publishConcurrencyExceptionHttp({
          ...baseErrorPayload,
          type: 'ConcurrencyException',
          userMessage: 'The data has been modified by another user. Please refresh and try again.',
        });
        break;

      case ErrorStatusCode.UnauthorizedLogin:
        this.eventBus.publishUnauthorizedHttp({
          ...baseErrorPayload,
          type: 'Unauthorized',
          userMessage: 'Invalid credentials or unauthorized access.',
        });
        break;

      case ErrorStatusCode.Forbidden:
        this.eventBus.publishForbiddenHttp({
          ...baseErrorPayload,
          type: 'Forbidden',
          userMessage: 'Invalid credentials or unauthorized access.',
        });
        break;

      case ErrorStatusCode.AppError:
        this.eventBus.publishAppErrorHttp({
          ...baseErrorPayload,
          type: 'AppError',
          userMessage: error.error?.message || 'An application error occurred. Please try again or contact support.',
        });
        break;
      // Use app Error for not implemented
      case ErrorStatusCode.NotImplemented:
        this.eventBus.publishAppErrorHttp({
          ...baseErrorPayload,
          type: 'AppError',
          userMessage: 'NOT IMPLEMENTED',
        });
        break;
      default:
        // For all other HTTP errors, publish a generic HTTP error event
        this.eventBus.publishHttpError({
          ...baseErrorPayload,
          type: 'HttpError',
          userMessage: error.statusText || `HTTP ${error.status}: An error occurred while processing your request.`,
        });
        break;
    }
  }
}
