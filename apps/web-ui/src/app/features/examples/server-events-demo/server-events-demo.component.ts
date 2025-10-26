import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ServerEventsDemoService } from './server-events-demo.service';
import { ApiSyncEventsService } from '@ai-nx-starter/api-client';
import { IMdSyncEvent, SyncEventType } from '@ai-nx-starter/types';
import { NzMessageService } from 'ng-zorro-antd/message';

interface ReceivedEvent extends IMdSyncEvent {
  timestamp: Date;
}

@Component({
  selector: 'app-server-events-demo',
  standalone: false,
  templateUrl: './server-events-demo.component.html',
  styleUrls: ['./server-events-demo.component.less'],
})
export class ServerEventsDemoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  eventForm!: FormGroup;
  receivedEvents: ReceivedEvent[] = [];
  publishing = false;

  // Event type options
  eventTypeOptions = [
    { label: 'Heartbeat', value: SyncEventType.Heartbeat },
    { label: 'Data Update', value: SyncEventType.DataUpdate },
    { label: 'User Action', value: SyncEventType.UserAction },
    { label: 'System Alert', value: SyncEventType.SystemAlert },
  ];

  constructor(
    private fb: FormBuilder,
    private serverEventsDemoService: ServerEventsDemoService,
    private apiSyncEventsService: ApiSyncEventsService,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.subscribeToEvents();
  }

  private initForm(): void {
    this.eventForm = this.fb.group({
      type: [SyncEventType.DataUpdate, [Validators.required]],
      data: ['', [Validators.required]],
      userId: [''],
    });
  }

  private subscribeToEvents(): void {
    this.serverEventsDemoService.events$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (event: IMdSyncEvent) => {
        this.receivedEvents.unshift({
          ...event,
          timestamp: new Date(),
        });
        // Keep only last 50 events
        if (this.receivedEvents.length > 50) {
          this.receivedEvents = this.receivedEvents.slice(0, 50);
        }
      },
      error: (error) => {
        console.error('SSE Error:', error);
        this.message.error('Connection to server lost');
      },
    });
  }

  onPublishEvent(): void {
    if (this.eventForm.invalid) {
      Object.values(this.eventForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.publishing = true;
    const eventData: IMdSyncEvent = {
      type: this.eventForm.value.type,
      data: this.eventForm.value.data,
      userId: this.eventForm.value.userId || undefined,
    };

    this.apiSyncEventsService.emitEvent(eventData).subscribe({
      next: () => {
        this.message.success('Event published successfully');
        this.eventForm.patchValue({ data: '' });
        this.publishing = false;
      },
      error: (error) => {
        console.error('Publish error:', error);
        this.message.error('Failed to publish event');
        this.publishing = false;
      },
    });
  }

  onClearEvents(): void {
    this.receivedEvents = [];
    this.message.info('Events cleared');
  }

  getEventTypeLabel(type: SyncEventType): string {
    const option = this.eventTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type;
  }

  getEventTypeBadgeColor(type: SyncEventType): string {
    switch (type) {
      case SyncEventType.Heartbeat:
        return 'default';
      case SyncEventType.DataUpdate:
        return 'blue';
      case SyncEventType.UserAction:
        return 'green';
      case SyncEventType.SystemAlert:
        return 'red';
      default:
        return 'default';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
