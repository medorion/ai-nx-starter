import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ServerFlowsService } from './server-flows.service';
import { SyncServiceFlowDto, FlowStatus, SyncServiceFlowSearchOptionsDto, QueryResultDto, IMdWorkflow, IMdActivity } from '@medorion/types';

@Component({
  selector: 'app-server-flows',
  standalone: false,
  templateUrl: './server-flows.component.html',
  styleUrl: './server-flows.component.less',
})
export class ServerFlowsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  flows: SyncServiceFlowDto[] = [];
  loading = false;

  // Search filters
  searchFlowId = '';
  searchMessageId = '';
  searchStatus: string | null = null;

  // Table configuration
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  // Drawer
  drawerVisible = false;
  selectedFlow: SyncServiceFlowDto | null = null;
  parsedWorkflow: IMdWorkflow | null = null;

  // Enum for template
  FlowStatus = FlowStatus;

  // Status options for filter
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Started', value: FlowStatus.Started },
    { label: 'Completed', value: FlowStatus.Completed },
    { label: 'Failed', value: FlowStatus.Failed },
    { label: 'Cancelled', value: FlowStatus.Cancelled },
  ];

  // Maps for status display
  statusBadgeMap: Record<FlowStatus, 'processing' | 'success' | 'error' | 'default'> = {
    [FlowStatus.Started]: 'processing',
    [FlowStatus.Completed]: 'success',
    [FlowStatus.Failed]: 'error',
    [FlowStatus.Cancelled]: 'default',
  };

  statusTextMap: Record<FlowStatus, string> = {
    [FlowStatus.Started]: 'Started',
    [FlowStatus.Completed]: 'Completed',
    [FlowStatus.Failed]: 'Failed',
    [FlowStatus.Cancelled]: 'Cancelled',
  };

  constructor(
    private serverFlowsService: ServerFlowsService,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    console.log('ServerFlowsComponent initialized');
    this.loadFlows();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFlows(): void {
    const searchOptions: SyncServiceFlowSearchOptionsDto = {
      flowId: this.searchFlowId || undefined,
      messageId: this.searchMessageId || undefined,
      status: this.searchStatus || undefined,
      includeFlowDefinition: false,
      limit: this.pageSize,
      offset: (this.pageIndex - 1) * this.pageSize,
    };

    console.log('Loading flows with options:', searchOptions);

    this.serverFlowsService
      .searchFlows(searchOptions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: QueryResultDto<SyncServiceFlowDto>) => {
          this.flows = result.data;
          this.total = result.total;
          console.log('✅ Loaded flows:', this.flows.length, 'Total:', this.total, 'Result:', result);
        },
        error: (error: any) => {
          this.message.error('Failed to load server flows');
          console.error('❌ Error loading server flows:', error);
        },
      });
  }

  private subscribeToLoading(): void {
    this.serverFlowsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  onSearch(): void {
    this.pageIndex = 1; // Reset to first page when searching
    this.loadFlows();
  }

  onReset(): void {
    this.searchFlowId = '';
    this.searchMessageId = '';
    this.searchStatus = null;
    this.pageIndex = 1;
    this.loadFlows();
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadFlows();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1; // Reset to first page when changing page size
    this.loadFlows();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  formatDuration(startTime: number, endTime?: number): string {
    if (!endTime) {
      return 'In progress';
    }
    const duration = endTime - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  onViewDetails(flow: SyncServiceFlowDto): void {
    this.drawerVisible = true;
    
    // Fetch flow with parsed workflow from server
    this.serverFlowsService
      .getFlowWithWorkflow(flow.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.selectedFlow = result.flow;
          this.parsedWorkflow = result.workflow;
          console.log('✅ Loaded flow with workflow:', result);
          console.log('Root activity:', result.workflow?.rootActivity);
          console.log('Children count:', result.workflow?.rootActivity?.children?.length);
        },
        error: (error: any) => {
          this.message.error('Failed to load flow details');
          console.error('❌ Error loading flow details:', error);
        },
      });
  }

  onDrawerClose(): void {
    this.drawerVisible = false;
    this.selectedFlow = null;
    this.parsedWorkflow = null;
  }

  getActivityStatusIcon(status: FlowStatus): string {
    switch (status) {
      case FlowStatus.Started:
        return 'loading';
      case FlowStatus.Completed:
        return 'check-circle';
      case FlowStatus.Failed:
        return 'close-circle';
      case FlowStatus.Cancelled:
        return 'stop';
      default:
        return 'question-circle';
    }
  }

  getActivityStatusColor(status: FlowStatus): string {
    switch (status) {
      case FlowStatus.Started:
        return '#1890ff';
      case FlowStatus.Completed:
        return '#52c41a';
      case FlowStatus.Failed:
        return '#ff4d4f';
      case FlowStatus.Cancelled:
        return '#d9d9d9';
      default:
        return '#8c8c8c';
    }
  }

  getActivityStatusBadge(activity: IMdActivity): 'processing' | 'success' | 'error' | 'default' {
    const status = activity.status as FlowStatus;
    return this.statusBadgeMap[status] || 'default';
  }

  getActivityStatusText(activity: IMdActivity): string {
    const status = activity.status as FlowStatus;
    return this.statusTextMap[status] || 'Unknown';
  }
}
