import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerSideEventsService } from '../../../core/services/server-side-events.service';
import { ApiSyncEventsService, AppConfigService } from '@monorepo-kit/api-client';
import { IMdSyncEvent } from '@monorepo-kit/types';

@Injectable()
export class ServerEventsDemoService {
  public events$: Observable<IMdSyncEvent>;

  constructor(
    private readonly serverSideEventsService: ServerSideEventsService,
    private readonly apiSyncEventsService: ApiSyncEventsService,
    private readonly appConfigService: AppConfigService,
  ) {
    // Initialize the SSE connection and expose it as an observable
    this.events$ = this.serverSideEventsService.getServerSentEvents(
      `${this.appConfigService.apiUrl}/monorepo-kit/rest/api/v2/dho/events/stream-to-all`,
    );
  }
}
