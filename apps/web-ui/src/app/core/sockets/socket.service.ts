import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Note: Install socket.io-client with: npm install socket.io-client
// import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  // private socket: Socket;

  constructor() {
    // Uncomment when socket.io-client is installed
    // this.socket = io('http://localhost:3000', { transports: ['websocket'] });
  }

  on<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      // Uncomment when socket.io-client is installed
      // this.socket.on(event, (data: T) => subscriber.next(data));

      // Mock implementation for now
      console.log(`Listening for event: ${event}`);
    });
  }

  emit(event: string, payload?: any): void {
    // Uncomment when socket.io-client is installed
    // this.socket.emit(event, payload);

    // Mock implementation for now
    console.log(`Emitting event: ${event}`, payload);
  }

  disconnect(): void {
    // Uncomment when socket.io-client is installed
    // this.socket.disconnect();

    console.log('Socket disconnected');
  }
}
