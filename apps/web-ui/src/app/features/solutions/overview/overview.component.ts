import { Component, OnInit } from '@angular/core';

interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'reminder' | 'followup';
  description?: string;
  daysUntil: number;
}

interface Channel {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'ivr' | 'facebook' | 'whatsapp';
  status: 'active' | 'inactive' | 'pending';
  lastUsed?: Date;
  totalSent: number;
}

interface SolutionStats {
  totalEvents: number;
  activeChannels: number;
  messagesThisMonth: number;
  successRate: number;
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  standalone: false,
  styleUrl: './overview.component.less',
})
export class OverviewComponent implements OnInit {
  upcomingEvents: UpcomingEvent[] = [];
  channels: Channel[] = [];
  stats: SolutionStats = {
    totalEvents: 0,
    activeChannels: 0,
    messagesThisMonth: 0,
    successRate: 0,
  };

  ngOnInit(): void {
    this.loadUpcomingEvents();
    this.loadChannels();
    this.loadStats();
  }

  private loadUpcomingEvents(): void {
    const currentDate = new Date();
    const events = [
      {
        id: '1',
        title: 'Patient Follow-up Call',
        date: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        type: 'followup' as const,
        description: 'Follow-up call with patient about medication',
        daysUntil: 2,
      },
      {
        id: '2',
        title: 'Vaccination Reminder',
        date: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        type: 'reminder' as const,
        description: 'Annual vaccination due',
        daysUntil: 5,
      },
      {
        id: '3',
        title: 'Health Check Appointment',
        date: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        type: 'appointment' as const,
        description: 'Routine health check appointment',
        daysUntil: 7,
      },
      {
        id: '4',
        title: 'Lab Results Follow-up',
        date: new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        type: 'followup' as const,
        description: 'Discuss lab results with patient',
        daysUntil: 10,
      },
    ];

    this.upcomingEvents = events;
  }

  private loadChannels(): void {
    this.channels = [
      {
        id: '1',
        name: 'SMS Notifications',
        type: 'sms',
        status: 'active',
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        totalSent: 1247,
      },
      {
        id: '2',
        name: 'Email Campaigns',
        type: 'email',
        status: 'active',
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        totalSent: 856,
      },
      {
        id: '3',
        name: 'IVR System',
        type: 'ivr',
        status: 'active',
        lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        totalSent: 432,
      },
      {
        id: '4',
        name: 'Facebook Messaging',
        type: 'facebook',
        status: 'inactive',
        totalSent: 89,
      },
      {
        id: '5',
        name: 'WhatsApp Business',
        type: 'whatsapp',
        status: 'pending',
        totalSent: 0,
      },
    ];
  }

  private loadStats(): void {
    this.stats = {
      totalEvents: 24,
      activeChannels: this.channels.filter((c) => c.status === 'active').length,
      messagesThisMonth: 3456,
      successRate: 94.2,
    };
  }

  getChannelIcon(type: string): string {
    const iconMap: Record<string, string> = {
      sms: 'mobile',
      email: 'mail',
      ivr: 'phone',
      facebook: 'facebook',
      whatsapp: 'wechat',
    };
    return iconMap[type] || 'message';
  }

  getEventIcon(type: string): string {
    const iconMap: Record<string, string> = {
      appointment: 'calendar',
      reminder: 'bell',
      followup: 'phone',
    };
    return iconMap[type] || 'calendar';
  }

  getChannelStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      active: 'success',
      inactive: 'default',
      pending: 'warning',
    };
    return colorMap[status] || 'default';
  }
}
