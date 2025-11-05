// src/events/events.controller.ts
import { Controller, Sse, Post, Body, Param, Query, UnauthorizedException } from '@nestjs/common';
import { Observable, interval, merge, map, filter } from 'rxjs';
import { SyncEventsService, SessionService, SessionExpiredException, Authorize, IgnoreAuthorization } from '@ai-nx-starter/backend-common';
import { IMdSyncEvent, SyncEventType, Role } from '@ai-nx-starter/types';

@Controller('events')
export class SyncEventsController {
  constructor(
    private readonly eventsService: SyncEventsService,
    private readonly sessionService: SessionService,
  ) {}

  // The client connects to /events/stream-to-user/some-user-id?token=xxx&types=DataUpdate,UserAction
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

  /**
   * This endpoint is for clients to subscribe to events.
   * The @Sse() decorator tells NestJS to treat this as an SSE endpoint.
   * Token must be passed as query parameter: /events/stream-to-all?token=xxx&types=DataUpdate,UserAction
   */
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

  /**
   * A helper endpoint to easily test the SSE functionality.
   * In a real app, you would call `eventsService.emit()` from other services
   * where events originate (e.g., after a database update, job completion, etc.).
   */
  @Authorize(Role.Admin)
  @Post('emit')
  emitEvent(@Body() event: IMdSyncEvent) {
    this.eventsService.emit(event);
    return { success: true, message: 'Event emitted.' };
  }
}
