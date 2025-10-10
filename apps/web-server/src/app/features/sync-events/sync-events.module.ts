// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { SyncEventsController } from './sync-events.controller';
import { SyncEventsService } from '@monorepo-kit/backend-common';

@Module({
  controllers: [SyncEventsController],
  // Make EventsService a provider and export it so other modules can inject it.
  providers: [SyncEventsService],
  exports: [SyncEventsService],
})
export class SyncEventsModule {}
