import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { IMdSyncEvent } from '@monorepo-kit/types';
import { filter } from 'rxjs/operators';

/**
 * Service for handling sync service events.
 */
@Injectable()
export class SyncEventsService {
  /**
   * A Subject is a special type of Observable that allows values to be multicasted to many Observers.
   * We will use this to push new events to all connected clients.
   */
  private readonly eventSubject = new Subject<IMdSyncEvent>();

  /**
   * Subscribes a client to the event stream.
   * The controller will call this method.
   * @returns An Observable that the client can subscribe to.
   */
  subscribe(): Observable<IMdSyncEvent> {
    return this.eventSubject.asObservable();
  }

  subscribeUser(userId: string): Observable<IMdSyncEvent> {
    // Return the observable, but pipe it through a filter
    return this.eventSubject.asObservable().pipe(
      // Only pass events that have no userId (broadcast) or match the client's userId
      filter((event) => event.userId === undefined || event.userId === userId),
    );
  }
  /**
   * Emits a new event to all subscribed clients.
   * Other parts of your application (e.g., another service after a long job) will call this.
   * @param event The event data to send.
   */
  emit(event: IMdSyncEvent) {
    this.eventSubject.next(event);
  }
}
