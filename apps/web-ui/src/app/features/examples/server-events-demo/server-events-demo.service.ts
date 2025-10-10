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
    // Pass token as query parameter since EventSource doesn't support custom headers
    const config = this.appConfigService.getConfig();
    const token = config.token || '';
    this.events$ = this.serverSideEventsService.getServerSentEvents(
      `${this.appConfigService.apiUrl}/monorepo-kit/rest/api/v2/events/stream-to-all?token=${encodeURIComponent(token)}`,
    );
  }
}
