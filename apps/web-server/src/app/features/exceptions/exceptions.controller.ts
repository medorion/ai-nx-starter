import { Controller, Get } from '@nestjs/common';
import {
  SessionExpiredException,
  AppWarningException,
  ConcurencyException,
  UnauthorizedLoginException,
  AppErrorException,
  Authorize,
} from '@ai-nx-starter/backend-common';
import { Role } from '@ai-nx-starter/types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Exceptions controller for testing and demonstrating error handling
 * This controller contains methods to trigger different types of exceptions
 * for testing the error handling system
 */
@ApiTags('Exceptions')
@ApiBearerAuth('bearer')
@Controller('examples/exceptions')
export class ExceptionsController {
  @ApiOperation({
    summary: 'Trigger SessionExpired exception',
    description:
      'Demo endpoint that throws a SessionExpiredException (HTTP 455). Use this to test how the client handles session expiration.',
  })
  @ApiResponse({
    status: 455,
    description: 'SessionExpiredException thrown',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Your session has expired. Please log in again.' },
        timestamp: { type: 'string' },
        sessionId: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.Admin)
  @Get('session-expired')
  triggerSessionExpired(): never {
    throw new SessionExpiredException({
      message: 'Your session has expired. Please log in again.',
      timestamp: new Date().toISOString(),
      sessionId: 'demo-session-123',
      reason: 'Token expired after 24 hours of inactivity',
    });
  }

  @ApiOperation({
    summary: 'Trigger AppWarning exception',
    description:
      'Demo endpoint that throws an AppWarningException (HTTP 456). Use this to test how the client handles application warnings.',
  })
  @ApiResponse({
    status: 456,
    description: 'AppWarningException thrown',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'This is a demonstration warning from the application.' },
        timestamp: { type: 'string' },
        warningCode: { type: 'string' },
        details: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.Admin)
  @Get('app-warning')
  triggerAppWarning(): never {
    throw new AppWarningException({
      message: 'This is a demonstration warning from the application.',
      timestamp: new Date().toISOString(),
      warningCode: 'DEMO_WARNING_001',
      details: 'This warning is triggered for testing purposes and demonstrates how warnings are handled in the system.',
    });
  }

  @ApiOperation({
    summary: 'Trigger Concurrency exception',
    description:
      'Demo endpoint that throws a ConcurencyException (HTTP 457). Use this to test how the client handles concurrency conflicts (optimistic locking).',
  })
  @ApiResponse({
    status: 457,
    description: 'ConcurencyException thrown',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'The data has been modified by another user. Please refresh and try again.' },
        timestamp: { type: 'string' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        conflictDetails: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.Admin)
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
        attemptedVersion: 1,
      },
    });
  }

  @ApiOperation({
    summary: 'Trigger UnauthorizedLogin exception',
    description:
      'Demo endpoint that throws an UnauthorizedLoginException (HTTP 458). Use this to test how the client handles failed login attempts.',
  })
  @ApiResponse({
    status: 458,
    description: 'UnauthorizedLoginException thrown',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid credentials or unauthorized access attempt.' },
        timestamp: { type: 'string' },
        attemptedEmail: { type: 'string' },
        loginAttempts: { type: 'number' },
        reason: { type: 'string' },
        lockoutTime: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.Admin)
  @Get('unauthorized-login')
  triggerUnauthorizedLogin(): never {
    throw new UnauthorizedLoginException({
      message: 'Invalid credentials or unauthorized access attempt.',
      timestamp: new Date().toISOString(),
      attemptedEmail: 'demo@example.com',
      loginAttempts: 3,
      reason: 'Invalid password provided',
      lockoutTime: 300, // 5 minutes
    });
  }

  @ApiOperation({
    summary: 'Trigger AppError exception',
    description:
      'Demo endpoint that throws an AppErrorException (HTTP 459). Use this to test how the client handles critical application errors.',
  })
  @ApiResponse({
    status: 459,
    description: 'AppErrorException thrown',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'A critical application error occurred during processing.' },
        timestamp: { type: 'string' },
        errorCode: { type: 'string' },
        context: { type: 'object' },
        details: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.Admin)
  @Get('app-error')
  triggerAppError(): never {
    throw new AppErrorException({
      message: 'A critical application error occurred during processing.',
      timestamp: new Date().toISOString(),
      errorCode: 'DEMO_APP_ERROR_001',
      context: {
        operation: 'demo-operation',
        userId: 'demo-user-789',
        requestId: 'req-' + Math.random().toString(36).substr(2, 9),
      },
      details: 'This is a demonstration of how critical application errors are handled and reported to the client.',
    });
  }

  @ApiOperation({
    summary: 'List exception endpoints',
    description: 'Get a list of all available exception testing endpoints with their status codes and descriptions',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved exception endpoints list',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Exception testing endpoints available' },
        endpoints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              method: { type: 'string' },
              exception: { type: 'string' },
              statusCode: { type: 'number' },
              description: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.Admin)
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
          description: 'Triggers a session expired error',
        },
        {
          path: '/examples/exceptions/app-warning',
          method: 'GET',
          exception: 'AppWarningException',
          statusCode: 456,
          description: 'Triggers an application warning',
        },
        {
          path: '/examples/exceptions/concurrency-error',
          method: 'GET',
          exception: 'ConcurencyException',
          statusCode: 457,
          description: 'Triggers a concurrency/conflict error',
        },
        {
          path: '/examples/exceptions/unauthorized-login',
          method: 'GET',
          exception: 'UnauthorizedLoginException',
          statusCode: 458,
          description: 'Triggers an unauthorized login error',
        },
        {
          path: '/examples/exceptions/app-error',
          method: 'GET',
          exception: 'AppErrorException',
          statusCode: 459,
          description: 'Triggers a critical application error',
        },
      ],
    };
  }
}
