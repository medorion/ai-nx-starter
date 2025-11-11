import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { GlobalHttpInterceptor } from './global-http.interceptor';
import { AppConfigService } from '@ai-nx-starter/api-client';
import { EventBusService } from '../services/event-bus.service';
import { ErrorStatusCode } from '@ai-nx-starter/types';

describe('GlobalHttpInterceptor', () => {
  let interceptor: GlobalHttpInterceptor;
  let appConfigService: jest.Mocked<AppConfigService>;
  let eventBusService: jest.Mocked<EventBusService>;
  let httpHandler: jest.Mocked<HttpHandler>;

  beforeEach(() => {
    const mockAppConfigService = {
      getConfig: jest.fn().mockReturnValue({
        apiUrl: 'http://localhost:3030',
        orgCode: 'test-org',
        version: '1.0.0',
        token: 'test-token-123',
      }),
    };

    const mockEventBusService = {
      publishSessionExpiredHttp: jest.fn(),
      publishAppWarningHttp: jest.fn(),
      publishConcurrencyExceptionHttp: jest.fn(),
      publishUnauthorizedHttp: jest.fn(),
      publishForbiddenHttp: jest.fn(),
      publishAppErrorHttp: jest.fn(),
      publishHttpError: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        GlobalHttpInterceptor,
        { provide: AppConfigService, useValue: mockAppConfigService },
        { provide: EventBusService, useValue: mockEventBusService },
      ],
    });

    interceptor = TestBed.inject(GlobalHttpInterceptor);
    appConfigService = TestBed.inject(AppConfigService) as jest.Mocked<AppConfigService>;
    eventBusService = TestBed.inject(EventBusService) as jest.Mocked<EventBusService>;

    httpHandler = {
      handle: jest.fn(),
    } as unknown as jest.Mocked<HttpHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Modification', () => {
    it('should add custom headers to outgoing requests', (done) => {
      const request = new HttpRequest('GET', '/api/test');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      httpHandler.handle.mockReturnValue(of(mockResponse));

      interceptor.intercept(request, httpHandler).subscribe(() => {
        const modifiedRequest = httpHandler.handle.mock.calls[0][0] as HttpRequest<any>;

        expect(modifiedRequest.headers.get('Content-Type')).toBe('application/json');
        expect(modifiedRequest.headers.get('X-App-Version')).toBe('1.0.0');
        expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer test-token-123');
        done();
      });
    });

    it('should use token from AppConfigService', (done) => {
      appConfigService.getConfig.mockReturnValue({
        apiUrl: 'http://localhost:3030',
        orgCode: 'test-org',
        version: '2.0.0',
        token: 'custom-token-xyz',
      });

      const request = new HttpRequest('POST', '/api/data', {});
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      httpHandler.handle.mockReturnValue(of(mockResponse));

      interceptor.intercept(request, httpHandler).subscribe(() => {
        const modifiedRequest = httpHandler.handle.mock.calls[0][0] as HttpRequest<any>;

        expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer custom-token-xyz');
        expect(modifiedRequest.headers.get('X-App-Version')).toBe('2.0.0');
        done();
      });
    });

    it('should default to version 1.0.0 when version is not set', (done) => {
      appConfigService.getConfig.mockReturnValue({
        apiUrl: 'http://localhost:3030',
        orgCode: 'test-org',
        version: undefined,
        token: 'test-token',
      });

      const request = new HttpRequest('GET', '/api/test');
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      httpHandler.handle.mockReturnValue(of(mockResponse));

      interceptor.intercept(request, httpHandler).subscribe(() => {
        const modifiedRequest = httpHandler.handle.mock.calls[0][0] as HttpRequest<any>;

        expect(modifiedRequest.headers.get('X-App-Version')).toBe('1.0.0');
        done();
      });
    });

    it('should not modify request body', (done) => {
      const requestBody = { name: 'Test', value: 123 };
      const request = new HttpRequest('POST', '/api/data', requestBody);
      const mockResponse = new HttpResponse({ status: 200, body: {} });

      httpHandler.handle.mockReturnValue(of(mockResponse));

      interceptor.intercept(request, httpHandler).subscribe(() => {
        const modifiedRequest = httpHandler.handle.mock.calls[0][0] as HttpRequest<any>;

        expect(modifiedRequest.body).toEqual(requestBody);
        done();
      });
    });
  });

  describe('Error Handling - Specific Error Codes', () => {
    it('should publish SessionExpired event for ErrorStatusCode.SessionExpired (440)', (done) => {
      const request = new HttpRequest('GET', '/api/protected');
      const error = new HttpErrorResponse({
        status: ErrorStatusCode.SessionExpired,
        statusText: 'Session Expired',
        url: '/api/protected',
        error: { message: 'Session expired' },
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishSessionExpiredHttp).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ErrorStatusCode.SessionExpired,
              type: 'SessionExpired',
              userMessage: 'Your session has expired. Please log in again.',
              url: '/api/protected',
              method: 'GET',
            }),
          );
          done();
        },
      });
    });

    it('should publish AppWarning event for ErrorStatusCode.AppWarning (455)', (done) => {
      const request = new HttpRequest('POST', '/api/action', {});
      const error = new HttpErrorResponse({
        status: ErrorStatusCode.AppWarning,
        statusText: 'Warning',
        url: '/api/action',
        error: { message: 'Custom warning message' },
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishAppWarningHttp).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ErrorStatusCode.AppWarning,
              type: 'AppWarning',
              userMessage: 'Custom warning message',
            }),
          );
          done();
        },
      });
    });

    it('should publish ConcurrencyException event for ErrorStatusCode.ConcurencyException (450)', (done) => {
      const request = new HttpRequest('PUT', '/api/update', {});
      const error = new HttpErrorResponse({
        status: ErrorStatusCode.ConcurencyException,
        statusText: 'Concurrency Error',
        url: '/api/update',
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishConcurrencyExceptionHttp).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ErrorStatusCode.ConcurencyException,
              type: 'ConcurrencyException',
              userMessage: 'The data has been modified by another user. Please refresh and try again.',
            }),
          );
          done();
        },
      });
    });

    it('should publish Unauthorized event for ErrorStatusCode.UnauthorizedLogin (461)', (done) => {
      const request = new HttpRequest('POST', '/api/login', {});
      const error = new HttpErrorResponse({
        status: ErrorStatusCode.UnauthorizedLogin,
        statusText: 'Unauthorized',
        url: '/api/login',
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishUnauthorizedHttp).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ErrorStatusCode.UnauthorizedLogin,
              type: 'Unauthorized',
              userMessage: 'Invalid credentials or unauthorized access.',
            }),
          );
          done();
        },
      });
    });

    it('should publish Forbidden event for ErrorStatusCode.Forbidden (403)', (done) => {
      const request = new HttpRequest('GET', '/api/admin');
      const error = new HttpErrorResponse({
        status: ErrorStatusCode.Forbidden,
        statusText: 'Forbidden',
        url: '/api/admin',
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishForbiddenHttp).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ErrorStatusCode.Forbidden,
              type: 'Forbidden',
              userMessage: 'Invalid credentials or unauthorized access.',
            }),
          );
          done();
        },
      });
    });

    it('should publish AppError event for ErrorStatusCode.AppError (460)', (done) => {
      const request = new HttpRequest('POST', '/api/process', {});
      const error = new HttpErrorResponse({
        status: ErrorStatusCode.AppError,
        statusText: 'Application Error',
        url: '/api/process',
        error: { message: 'Database connection failed' },
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishAppErrorHttp).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ErrorStatusCode.AppError,
              type: 'AppError',
              userMessage: 'Database connection failed',
            }),
          );
          done();
        },
      });
    });

    it('should publish AppError event for ErrorStatusCode.NotImplemented (501)', (done) => {
      const request = new HttpRequest('GET', '/api/feature');
      const error = new HttpErrorResponse({
        status: ErrorStatusCode.NotImplemented,
        statusText: 'Not Implemented',
        url: '/api/feature',
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishAppErrorHttp).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ErrorStatusCode.NotImplemented,
              type: 'AppError',
              userMessage: 'NOT IMPLEMENTED',
            }),
          );
          done();
        },
      });
    });
  });

  describe('Error Handling - Generic HTTP Errors', () => {
    it('should publish generic HttpError for 500 Internal Server Error', (done) => {
      const request = new HttpRequest('GET', '/api/data');
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        url: '/api/data',
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishHttpError).toHaveBeenCalledWith(
            expect.objectContaining({
              status: 500,
              type: 'HttpError',
              userMessage: 'Internal Server Error',
            }),
          );
          done();
        },
      });
    });

    it('should publish generic HttpError for 404 Not Found', (done) => {
      const request = new HttpRequest('GET', '/api/missing');
      const error = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: '/api/missing',
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishHttpError).toHaveBeenCalledWith(
            expect.objectContaining({
              status: 404,
              type: 'HttpError',
              userMessage: 'Not Found',
            }),
          );
          done();
        },
      });
    });

    it('should use default message when statusText is empty', (done) => {
      const request = new HttpRequest('GET', '/api/data');
      const error = new HttpErrorResponse({
        status: 503,
        statusText: '',
        url: '/api/data',
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishHttpError).toHaveBeenCalledWith(
            expect.objectContaining({
              userMessage: 'Unknown Error',
            }),
          );
          done();
        },
      });
    });
  });

  describe('Error Payload', () => {
    it('should include complete error information in payload', (done) => {
      const request = new HttpRequest('POST', '/api/test', { data: 'test' });
      const error = new HttpErrorResponse({
        status: ErrorStatusCode.SessionExpired,
        statusText: 'Session Expired',
        url: '/api/test',
        error: { code: 'ERR_SESSION', details: 'Token invalid' },
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          expect(eventBusService.publishSessionExpiredHttp).toHaveBeenCalledWith(
            expect.objectContaining({
              status: ErrorStatusCode.SessionExpired,
              message: error.message,
              url: '/api/test',
              method: 'POST',
              timestamp: expect.any(Number),
              error: { code: 'ERR_SESSION', details: 'Token invalid' },
            }),
          );
          done();
        },
      });
    });

    it('should include timestamp in error payload', (done) => {
      const request = new HttpRequest('GET', '/api/test');
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Error',
      });

      httpHandler.handle.mockReturnValue(throwError(() => error));

      const beforeTime = Date.now();

      interceptor.intercept(request, httpHandler).subscribe({
        error: () => {
          const afterTime = Date.now();
          const payload = eventBusService.publishHttpError.mock.calls[0][0];

          expect(payload.timestamp).toBeGreaterThanOrEqual(beforeTime);
          expect(payload.timestamp).toBeLessThanOrEqual(afterTime);
          done();
        },
      });
    });
  });

  describe('Successful Requests', () => {
    it('should not call any event bus methods on successful requests', (done) => {
      const request = new HttpRequest('GET', '/api/success');
      const mockResponse = new HttpResponse({ status: 200, body: { data: 'success' } });

      httpHandler.handle.mockReturnValue(of(mockResponse));

      interceptor.intercept(request, httpHandler).subscribe(() => {
        expect(eventBusService.publishSessionExpiredHttp).not.toHaveBeenCalled();
        expect(eventBusService.publishAppWarningHttp).not.toHaveBeenCalled();
        expect(eventBusService.publishConcurrencyExceptionHttp).not.toHaveBeenCalled();
        expect(eventBusService.publishUnauthorizedHttp).not.toHaveBeenCalled();
        expect(eventBusService.publishForbiddenHttp).not.toHaveBeenCalled();
        expect(eventBusService.publishAppErrorHttp).not.toHaveBeenCalled();
        expect(eventBusService.publishHttpError).not.toHaveBeenCalled();
        done();
      });
    });

    it('should pass through successful response without modification', (done) => {
      const request = new HttpRequest('GET', '/api/data');
      const expectedBody = { id: 1, name: 'Test' };
      const mockResponse = new HttpResponse({ status: 200, body: expectedBody });

      httpHandler.handle.mockReturnValue(of(mockResponse));

      interceptor.intercept(request, httpHandler).subscribe((response) => {
        if (response instanceof HttpResponse) {
          expect(response.body).toEqual(expectedBody);
          expect(response.status).toBe(200);
        }
        done();
      });
    });
  });
});
