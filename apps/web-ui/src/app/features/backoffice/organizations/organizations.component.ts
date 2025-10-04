import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrganizationsService } from './organizations.service';
import { OrganizationDto, OrganizationStatus } from '@medorion/types';

@Component({
  selector: 'app-organizations',
  standalone: false,
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.less',
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  organizations: OrganizationDto[] = [];
  filteredOrganizations: OrganizationDto[] = [];
  loading = false;
  searchQuery = '';

  // Table configuration
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  // Enum for template
  OrganizationStatus = OrganizationStatus;

  // Maps for status display
  statusBadgeMap: Record<OrganizationStatus, 'success' | 'default'> = {
    [OrganizationStatus.Active]: 'success',
    [OrganizationStatus.Suspended]: 'default'
  };

  statusTextMap: Record<OrganizationStatus, string> = {
    [OrganizationStatus.Active]: 'Active',
    [OrganizationStatus.Suspended]: 'Suspended'
  };

  statusActionMap: Record<OrganizationStatus, {
    action: string;
    buttonText: string;
    buttonType: 'default' | 'primary' | 'dashed' | 'link' | 'text';
    icon: string;
    tooltip: string;
  }> = {
    [OrganizationStatus.Active]: {
      action: 'suspend',
      buttonText: 'Suspend',
      buttonType: 'default' as const,
      icon: 'pause',
      tooltip: 'Suspend organization'
    },
    [OrganizationStatus.Suspended]: {
      action: 'activate',
      buttonText: 'Activate',
      buttonType: 'primary' as const,
      icon: 'play-circle',
      tooltip: 'Activate organization'
    }
  };

  constructor(
    private organizationsService: OrganizationsService,
    private router: Router,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrganizations(): void {
    this.organizationsService
      .getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (organizations) => {
          // Ensure all organizations have a valid status
          this.organizations = organizations.map(org => ({
            ...org,
            status: org.status || OrganizationStatus.Active
          }));
          this.applySearch();
        },
        error: (error) => {
          this.message.error('Failed to load organizations');
          console.error('Error loading organizations:', error);
        },
      });
  }

  private subscribeToLoading(): void {
    this.organizationsService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));
  }

  onSearch(): void {
    this.applySearch();
  }

  private applySearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredOrganizations = [...this.organizations];
    } else {
      this.filteredOrganizations = this.organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          org.code.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.total = this.filteredOrganizations.length;
    this.pageIndex = 1; // Reset to first page when searching
  }

  onToggleStatus(organization: OrganizationDto): void {
    const newStatus = organization.status === OrganizationStatus.Active
      ? OrganizationStatus.Suspended
      : OrganizationStatus.Active;

    this.updateOrganizationStatus(organization.id!, newStatus);
  }

  private updateOrganizationStatus(id: string, status: OrganizationStatus): void {
    this.organizationsService
      .updateOrganizationStatus(id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const action = status === OrganizationStatus.Active ? 'activated' : 'deactivated';
          this.message.success(`Organization ${action} successfully`);
          this.loadOrganizations(); // Refresh the list
        },
        error: (error) => {
          this.message.error('Failed to update organization status');
          console.error('Error updating organization status:', error);
        },
      });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1; // Reset to first page when changing page size
  }

  onCreateOrganization(): void {
    this.router.navigate(['/backoffice/organizations/new']);
  }

  onEditOrganization(organization: OrganizationDto): void {
    this.router.navigate(['/backoffice/organizations', organization.id, 'edit']);
  }

  // Get paginated data for current page
  get paginatedOrganizations(): OrganizationDto[] {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredOrganizations.slice(startIndex, endIndex);
  }
}
