// src/events/events.controller.ts
import { Controller, Sse, Post, Body, Param } from '@nestjs/common';
import { Observable, interval, merge, map } from 'rxjs';
import { SyncEventsService } from '@monorepo-kit/backend-common';
import { IMdSyncEvent, SyncEventType, Role } from '@monorepo-kit/types';
import { Authorize } from '@monorepo-kit/backend-common';

@Controller('events')
export class SyncEventsController {
  constructor(private readonly eventsService: SyncEventsService) {}

  // The client connects to /events/stream-to-user/some-user-id
  @Authorize(Role.Admin)
  @Sse('stream-to-user/:userId')
  streamEventsToUser(@Param('userId') userId: string): Observable<IMdSyncEvent> {
    const userEventStream = this.eventsService.subscribeUser(userId);

    // Create a heartbeat stream that emits a comment every 15 seconds
    const heartbeatStream = interval(15000).pipe(map(() => ({ type: SyncEventType.Heartbeat, data: 'ping' }) as IMdSyncEvent));

    // Merge the two streams
    return merge(userEventStream, heartbeatStream);
  }

  /**
   * This endpoint is for clients to subscribe to events.
   * The @Sse() decorator tells NestJS to treat this as an SSE endpoint.
   */
  @Authorize(Role.Admin)
  @Sse('stream-to-all')
  streamEvents(): Observable<IMdSyncEvent> {
    const userEventStream = this.eventsService.subscribe();

    // Create a heartbeat stream that emits a comment every 15 seconds
    const heartbeatStream = interval(15000).pipe(map(() => ({ type: SyncEventType.Heartbeat, data: 'ping' }) as IMdSyncEvent));
    // Merge the two streams
    return merge(userEventStream, heartbeatStream);
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
