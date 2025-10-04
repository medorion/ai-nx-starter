import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'reminder' | 'followup';
  description?: string;
}

@Component({
  selector: 'app-event-scheduler',
  templateUrl: './event-scheduler.component.html',
  standalone: false,
  styleUrl: './event-scheduler.component.less',
})
export class EventSchedulerComponent implements OnInit {
  selectedDate: Date = new Date();
  events: CalendarEvent[] = [];
  isDrawerVisible = false;
  eventForm: FormGroup;
  editingEvent: CalendarEvent | null = null;

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      type: ['appointment', [Validators.required]],
      date: [new Date(), [Validators.required]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.generateDummyEvents();
  }

  onDateSelect(date: Date): void {
    this.selectedDate = date;
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events.filter((event) => event.date.toDateString() === date.toDateString());
  }

  dateCellRender = (date: Date): string => {
    const eventsCount = this.getEventsForDate(date).length;
    return eventsCount > 0 ? `${eventsCount}` : '';
  };

  onYearChange(year: number): void {
    const newDate = new Date(this.selectedDate);
    newDate.setFullYear(year);
    this.selectedDate = newDate;
  }

  onCreateEvent(): void {
    this.editingEvent = null;
    this.eventForm.reset({
      title: '',
      type: 'appointment',
      date: this.selectedDate,
      description: '',
    });
    this.isDrawerVisible = true;
  }

  onEditEvent(event: CalendarEvent): void {
    this.editingEvent = event;
    this.eventForm.patchValue({
      title: event.title,
      type: event.type,
      date: event.date,
      description: event.description || '',
    });
    this.isDrawerVisible = true;
  }

  onDeleteEvent(event: CalendarEvent): void {
    this.events = this.events.filter((e) => e.id !== event.id);
  }

  onDrawerClose(): void {
    this.isDrawerVisible = false;
    this.editingEvent = null;
    this.eventForm.reset();
  }

  onSaveEvent(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;

      if (this.editingEvent) {
        // Update existing event
        const eventIndex = this.events.findIndex((e) => e.id === this.editingEvent!.id);
        if (eventIndex !== -1) {
          this.events[eventIndex] = {
            ...this.editingEvent,
            title: formValue.title,
            type: formValue.type,
            date: formValue.date,
            description: formValue.description,
          };
        }
      } else {
        // Create new event
        const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          title: formValue.title,
          type: formValue.type,
          date: formValue.date,
          description: formValue.description,
        };
        this.events.push(newEvent);
      }

      this.onDrawerClose();
    }
  }

  get drawerTitle(): string {
    return this.editingEvent ? 'Edit Event' : 'Create New Event';
  }

  private generateDummyEvents(): void {
    const currentDate = new Date();
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Patient Follow-up Call',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        type: 'followup',
        description: 'Follow-up call with patient about medication',
      },
      {
        id: '2',
        title: 'Appointment Reminder',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        type: 'reminder',
        description: "Send reminder for tomorrow's appointment",
      },
      {
        id: '3',
        title: 'Health Check Appointment',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12),
        type: 'appointment',
        description: 'Routine health check appointment',
      },
      {
        id: '4',
        title: 'Vaccination Reminder',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        type: 'reminder',
        description: 'Annual vaccination due',
      },
      {
        id: '5',
        title: 'Lab Results Follow-up',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
        type: 'followup',
        description: 'Discuss lab results with patient',
      },
      {
        id: '6',
        title: 'Consultation Appointment',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25),
        type: 'appointment',
        description: 'New patient consultation',
      },
      {
        id: '7',
        title: 'Medication Review',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28),
        type: 'followup',
        description: 'Review current medications',
      },
    ];

    this.events = events;
  }
}
