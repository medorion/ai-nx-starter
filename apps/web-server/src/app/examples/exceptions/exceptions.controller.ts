import { Controller, Get } from '@nestjs/common';
import {
  SessionExpiredException,
  AppWarningException,
  ConcurencyException,
  UnauthorizedLoginException,
  AppErrorException,
} from '@medorion/backend-common';

/**
 * Exceptions controller for testing and demonstrating error handling
 * This controller contains methods to trigger different types of exceptions
 * for testing the error handling system
 */
@Controller('examples/exceptions')
export class ExceptionsController {

  /**
   * Trigger SessionExpired exception (455)
   * GET /examples/exceptions/session-expired
   */
  @Get('session-expired')
  triggerSessionExpired(): never {
    throw new SessionExpiredException({
      message: 'Your session has expired. Please log in again.',
      timestamp: new Date().toISOString(),
      sessionId: 'demo-session-123',
      reason: 'Token expired after 24 hours of inactivity'
    });
  }

  /**
   * Trigger AppWarning exception (456)
   * GET /examples/exceptions/app-warning
   */
  @Get('app-warning')
  triggerAppWarning(): never {
    throw new AppWarningException({
      message: 'This is a demonstration warning from the application.',
      timestamp: new Date().toISOString(),
      warningCode: 'DEMO_WARNING_001',
      details: 'This warning is triggered for testing purposes and demonstrates how warnings are handled in the system.'
    });
  }

  /**
   * Trigger Concurrency exception (457)
   * GET /examples/exceptions/concurrency-error
   */
  @Get('concurrency-error')
  triggerConcurrencyError(): never {
    throw new ConcurencyException({
      message: 'The data has been modified by another user. Please refresh and try again.',
      timestamp: new Date().toISOString(),
      entityType: 'TodoItem',
      entityId: 'demo-item-456',
      conflictDetails: {
        lastModifiedBy: 'user@example.com',
        lastModifiedAt: new Date(Date.now() - 5000).toISOString(),
        currentVersion: 2,
        attemptedVersion: 1
      }
    });
  }

  /**
   * Trigger UnauthorizedLogin exception (458)
   * GET /examples/exceptions/unauthorized-login
   */
  @Get('unauthorized-login')
  triggerUnauthorizedLogin(): never {
    throw new UnauthorizedLoginException({
      message: 'Invalid credentials or unauthorized access attempt.',
      timestamp: new Date().toISOString(),
      attemptedEmail: 'demo@example.com',
      loginAttempts: 3,
      reason: 'Invalid password provided',
      lockoutTime: 300 // 5 minutes
    });
  }

  /**
   * Trigger AppError exception (459)
   * GET /examples/exceptions/app-error
   */
  @Get('app-error')
  triggerAppError(): never {
    throw new AppErrorException({
      message: 'A critical application error occurred during processing.',
      timestamp: new Date().toISOString(),
      errorCode: 'DEMO_APP_ERROR_001',
      context: {
        operation: 'demo-operation',
        userId: 'demo-user-789',
        requestId: 'req-' + Math.random().toString(36).substr(2, 9)
      },
      details: 'This is a demonstration of how critical application errors are handled and reported to the client.'
    });
  }

  /**
   * Get list of available exception endpoints
   * GET /examples/exceptions
   */
  @Get()
  getExceptionEndpoints() {
    return {
      message: 'Exception testing endpoints available',
      endpoints: [
        {
          path: '/examples/exceptions/session-expired',
          method: 'GET',
          exception: 'SessionExpiredException',
          statusCode: 455,
          description: 'Triggers a session expired error'
        },
        {
          path: '/examples/exceptions/app-warning',
          method: 'GET',
          exception: 'AppWarningException',
          statusCode: 456,
          description: 'Triggers an application warning'
        },
        {
          path: '/examples/exceptions/concurrency-error',
          method: 'GET',
          exception: 'ConcurencyException',
          statusCode: 457,
          description: 'Triggers a concurrency/conflict error'
        },
        {
          path: '/examples/exceptions/unauthorized-login',
          method: 'GET',
          exception: 'UnauthorizedLoginException',
          statusCode: 458,
          description: 'Triggers an unauthorized login error'
        },
        {
          path: '/examples/exceptions/app-error',
          method: 'GET',
          exception: 'AppErrorException',
          statusCode: 459,
          description: 'Triggers a critical application error'
        }
      ]
    };
  }
}