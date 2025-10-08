import { Injectable, OnDestroy } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventBusService } from './event-bus.service';

@Injectable({ providedIn: 'root' })
export class MessageService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private message: NzMessageService,
    private eventBus: EventBusService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize HTTP error event subscriptions
   */
  public initializeHttpErrorHandling(): void {
    // Session Expired (455)
    this.eventBus
      .onSessionExpiredHttp()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.error(event.payload.userMessage, 6000);
      });

    // App Warning (456)
    this.eventBus
      .onAppWarningHttp()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.warning(event.payload.userMessage, 5000);
      });

    // Concurrency Exception (457)
    this.eventBus
      .onConcurrencyExceptionHttp()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.warning(event.payload.userMessage, 6000);
      });

    // Unauthorized Login (401)
    this.eventBus
      .onUnauthorizedHttp()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.error(event.payload.userMessage, 6000);
      });

    // Forbidden (403)
    this.eventBus
      .onForbiddenHttp()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.error(event.payload.userMessage, 6000);
      });

    // App Error (459)
    this.eventBus
      .onAppErrorHttp()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.error(event.payload.userMessage, 7000);
      });
  }

  public success(message: string, duration = 3000): void {
    this.message.success(message, { nzDuration: duration });
  }

  public error(message: string, duration = 5000): void {
    this.message.error(message, { nzDuration: duration });
  }

  public warning(message: string, duration = 4000): void {
    this.message.warning(message, { nzDuration: duration });
  }

  public info(message: string, duration = 3000): void {
    this.message.info(message, { nzDuration: duration });
  }

  public loading(message: string, duration = 0): void {
    this.message.loading(message, { nzDuration: duration });
  }

  public show(type: MessageType, message: string, duration?: number) {
    this.message.create(type, message, { nzDuration: duration });
  }
}

export enum MessageType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Loading = 'loading',
}
