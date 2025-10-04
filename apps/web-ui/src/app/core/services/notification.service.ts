import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private notification: NzNotificationService) {}

  success(message: string, duration = 3000): void {
    this.notification.success('Success', message, {
      nzDuration: duration,
    });
  }

  error(message: string, duration = 5000): void {
    this.notification.error('Error', message, {
      nzDuration: duration,
    });
  }

  warning(message: string, duration = 4000): void {
    this.notification.warning('Warning', message, {
      nzDuration: duration,
    });
  }

  info(message: string, duration = 3000): void {
    this.notification.info('Info', message, {
      nzDuration: duration,
    });
  }

  // TODO: add more custom options
  // for full flexibility if needed
  custom(type: 'success' | 'info' | 'warning' | 'error', title: string, duration?: number) {
    this.notification.create(type, title, '', { nzDuration: duration });
  }
}
