// src/app/sse.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServerSideEventsService {
  constructor(private _zone: NgZone) {}

  /**
   * Wraps the native EventSource in an RxJS Observable.
   * @param url The URL of the SSE endpoint.
   * @returns An Observable that emits events from the server.
   */
  getServerSentEvents(url: string): Observable<any> {
    return new Observable((subscriber) => {
      // 1. Create the EventSource object
      const eventSource = new EventSource(url);

      // 2. Handle incoming messages
      eventSource.onmessage = (event) => {
        // Run inside NgZone to ensure change detection is triggered
        this._zone.run(() => {
          subscriber.next(JSON.parse(event.data));
        });
      };

      // 3. Handle any errors
      eventSource.onerror = (error) => {
        this._zone.run(() => {
          subscriber.error(error);
          eventSource.close(); // Close the connection on error
        });
      };

      // 4. Return a teardown function to close the connection
      // This is called when the consumer unsubscribes.
      return () => {
        eventSource.close();
        console.log('EventSource connection closed.');
      };
    });
  }
}
