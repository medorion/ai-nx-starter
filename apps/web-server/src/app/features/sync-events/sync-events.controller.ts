// src/events/events.controller.ts
import { Controller, Sse, Post, Body, Param, Query, UnauthorizedException } from '@nestjs/common';
import { Observable, interval, merge, map, filter } from 'rxjs';
import { SyncEventsService, SessionService, SessionExpiredException, Authorize, IgnoreAuthorization } from '@ai-nx-starter/backend-common';
import { IMdSyncEvent, SyncEventType, Role } from '@ai-nx-starter/types';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class SyncEventsController {
  constructor(
    private readonly eventsService: SyncEventsService,
    private readonly sessionService: SessionService,
  ) {}

  @ApiOperation({
    summary: 'Stream events to specific user (SSE)',
    description:
      'Subscribe to Server-Sent Events for a specific user. Token required as query param (EventSource cannot send headers). Returns real-time events with heartbeat every 15 seconds. Requires Admin role.',
  })
  @ApiParam({ name: 'userId', description: 'User ID to stream events for', example: 'user-123' })
  @ApiQuery({ name: 'token', required: true, description: 'Session token from /auth/login', example: 'a1b2c3d4e5f6...64-char-hex-token' })
  @ApiQuery({
    name: 'types',
    required: false,
    description:
      'Comma-separated event types to filter (FlowStarted,FlowCompleted,FlowFailed,FlowCancelled,ActivityLog,Heartbeat,DataUpdate,UserAction,SystemAlert)',
    example: 'DataUpdate,UserAction',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE connection established - streaming events',
    content: {
      'text/event-stream': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: [
                    'FlowStarted',
                    'FlowCompleted',
                    'FlowFailed',
                    'FlowCancelled',
                    'ActivityLog',
                    'Heartbeat',
                    'DataUpdate',
                    'UserAction',
                    'SystemAlert',
                  ],
                },
                data: { oneOf: [{ type: 'string' }, { type: 'object' }] },
                userId: { type: 'string' },
                flowId: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 455, description: 'Session expired or not found' })
  @ApiResponse({ status: 401, description: 'Insufficient permissions (requires Admin)' })
  @IgnoreAuthorization()
  @Sse('stream-to-user/:userId')
  async streamEventsToUser(
    @Param('userId') userId: string,
    @Query('token') token: string,
    @Query('types') types?: string,
  ): Promise<Observable<MessageEvent>> {
    // Validate token manually since EventSource doesn't support headers
    await this.validateToken(token, Role.Admin);

    const userEventStream = this.eventsService.subscribeUser(userId);

    // Create a heartbeat stream that emits a comment every 15 seconds
    const heartbeatStream = interval(15000).pipe(map(() => ({ type: SyncEventType.Heartbeat, data: 'ping' }) as IMdSyncEvent));

    // Parse event types filter
    const eventTypes = types ? types.split(',').map((t) => t.trim() as SyncEventType) : null;

    // Merge the two streams, apply type filter, and wrap in SSE format
    return merge(userEventStream, heartbeatStream).pipe(
      filter((event) => !eventTypes || eventTypes.includes(event.type)),
      map((event) => ({ data: event }) as MessageEvent),
    );
  }

  @ApiOperation({
    summary: 'Stream events to all users (SSE)',
    description:
      'Subscribe to Server-Sent Events broadcast to all users. Token required as query param (EventSource cannot send headers). Returns real-time events with heartbeat every 15 seconds. Requires Admin role.',
  })
  @ApiQuery({ name: 'token', required: true, description: 'Session token from /auth/login', example: 'a1b2c3d4e5f6...64-char-hex-token' })
  @ApiQuery({
    name: 'types',
    required: false,
    description:
      'Comma-separated event types to filter (FlowStarted,FlowCompleted,FlowFailed,FlowCancelled,ActivityLog,Heartbeat,DataUpdate,UserAction,SystemAlert)',
    example: 'DataUpdate,UserAction',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE connection established - streaming events to all users',
    content: {
      'text/event-stream': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: [
                    'FlowStarted',
                    'FlowCompleted',
                    'FlowFailed',
                    'FlowCancelled',
                    'ActivityLog',
                    'Heartbeat',
                    'DataUpdate',
                    'UserAction',
                    'SystemAlert',
                  ],
                },
                data: { oneOf: [{ type: 'string' }, { type: 'object' }] },
                userId: { type: 'string' },
                flowId: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 455, description: 'Session expired or not found' })
  @ApiResponse({ status: 401, description: 'Insufficient permissions (requires Admin)' })
  @IgnoreAuthorization()
  @Sse('stream-to-all')
  async streamEvents(@Query('token') token: string, @Query('types') types?: string): Promise<Observable<MessageEvent>> {
    // Validate token manually since EventSource doesn't support headers
    await this.validateToken(token, Role.Admin);

    const userEventStream = this.eventsService.subscribe();

    // Create a heartbeat stream that emits a comment every 15 seconds
    const heartbeatStream = interval(15000).pipe(map(() => ({ type: SyncEventType.Heartbeat, data: 'ping' }) as IMdSyncEvent));

    // Parse event types filter
    const eventTypes = types ? types.split(',').map((t) => t.trim() as SyncEventType) : null;

    // Merge the two streams, apply type filter, and wrap in SSE format
    return merge(userEventStream, heartbeatStream).pipe(
      filter((event) => !eventTypes || eventTypes.includes(event.type)),
      map((event) => ({ data: event }) as MessageEvent),
    );
  }

  /**
   * Validates the session token and checks if user has required role
   */
  private async validateToken(token: string, requiredRole: Role): Promise<void> {
    if (!token) {
      throw new SessionExpiredException('Session token not found');
    }

    const sessionInfo = await this.sessionService.getSession(token);
    if (!sessionInfo) {
      throw new SessionExpiredException('Session not found');
    }

    // Check if session expired
    const expired = sessionInfo.expiresAt < new Date().getTime();
    if (expired) {
      await this.sessionService.killSessionByToken(sessionInfo.userId);
      throw new SessionExpiredException('Session expired');
    }

    // Validate role (simplified - you may want to use the full role validation from AuthorizeGuard)
    const roleWeights = new Map<Role, number>([
      [Role.Root, 120],
      [Role.Admin, 90],
    ]);

    const userWeight = roleWeights.get(sessionInfo.role as Role) || 0;
    const requiredWeight = roleWeights.get(requiredRole) || 0;

    if (userWeight < requiredWeight) {
      throw new UnauthorizedException(`User does not have required role: ${requiredRole}`);
    }
  }

  @ApiOperation({
    summary: 'Emit event (testing)',
    description:
      'Manually emit an event to all connected SSE clients. Useful for testing SSE functionality. In production, events are typically emitted from other services after database updates, job completion, etc. Requires Admin role.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [
            'FlowStarted',
            'FlowCompleted',
            'FlowFailed',
            'FlowCancelled',
            'ActivityLog',
            'Heartbeat',
            'DataUpdate',
            'UserAction',
            'SystemAlert',
          ],
          example: 'DataUpdate',
        },
        data: { oneOf: [{ type: 'string' }, { type: 'object' }], example: { message: 'Test event' } },
        userId: { type: 'string', example: 'user-123' },
        flowId: { type: 'string', example: 'flow-456' },
      },
      required: ['type', 'data'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Event successfully emitted to all connected clients',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Event emitted.' } },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions (requires Admin)' })
  @ApiBearerAuth('bearer')
  @Authorize(Role.Admin)
  @Post('emit')
  emitEvent(@Body() event: IMdSyncEvent) {
    this.eventsService.emit(event);
    return { success: true, message: 'Event emitted.' };
  }
}
