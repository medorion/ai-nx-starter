import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SolutionsService } from './solutions.service';
import { SolutionDto } from '@medorion/types';
import { UIAppContextService } from '../../../shared/services/ui-app-context.service';

@Component({
  selector: 'app-solutions',
  standalone: false,
  templateUrl: './solutions.component.html',
  styleUrl: './solutions.component.less',
})
export class SolutionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  solutions: SolutionDto[] = [];
  filteredSolutions: SolutionDto[] = [];
  loading = false;
  searchQuery = '';
  currentOrgCode: string | null = null;

  // Table configuration
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  // Maps for status display
  statusBadgeMap: Record<string, 'success' | 'default'> = {
    true: 'success',
    false: 'default',
  };

  statusTextMap: Record<string, string> = {
    true: 'Active',
    false: 'Inactive',
  };

  constructor(
    private solutionsService: SolutionsService,
    private router: Router,
    private message: NzMessageService,
    private uiAppContextService: UIAppContextService,
  ) {}

  ngOnInit(): void {
    // Get current organization code from context
    this.currentOrgCode = this.uiAppContextService.currentOrganization?.code || null;

    if (!this.currentOrgCode) {
      this.message.error('No organization selected');
      return;
    }

    this.loadSolutions();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSolutions(): void {
    if (!this.currentOrgCode) {
      return;
    }

    this.solutionsService
      .getSolutionsByOrgCode(this.currentOrgCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (solutions) => {
          this.solutions = solutions;
          this.applySearch();
        },
        error: (error) => {
          this.message.error('Failed to load solutions');
          console.error('Error loading solutions:', error);
        },
      });
  }

  private subscribeToLoading(): void {
    this.solutionsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  onSearch(): void {
    this.applySearch();
  }

  private applySearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSolutions = [...this.solutions];
    } else {
      this.filteredSolutions = this.solutions.filter(
        (solution) =>
          solution.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          solution.orgCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          solution.appCode.toString().includes(this.searchQuery),
      );
    }
    this.total = this.filteredSolutions.length;
    this.pageIndex = 1; // Reset to first page when searching
  }

  onToggleStatus(solution: SolutionDto): void {
    const newStatus = !solution.isActive;
    this.updateSolutionStatus(solution.id!, newStatus);
  }

  private updateSolutionStatus(id: string, isActive: boolean): void {
    this.solutionsService
      .updateSolutionStatus(id, isActive)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const action = isActive ? 'activated' : 'deactivated';
          this.message.success(`Solution ${action} successfully`);
          this.loadSolutions(); // Refresh the list
        },
        error: (error) => {
          this.message.error('Failed to update solution status');
          console.error('Error updating solution status:', error);
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

  onCreateSolution(): void {
    this.router.navigate(['/backoffice/solutions/new']);
  }

  onEditSolution(solution: SolutionDto): void {
    this.router.navigate(['/backoffice/solutions', solution.id, 'edit']);
  }

  // Get paginated data for current page
  get paginatedSolutions(): SolutionDto[] {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredSolutions.slice(startIndex, endIndex);
  }

  getStatusBadge(isActive: boolean): 'success' | 'default' {
    return isActive ? 'success' : 'default';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getStatusAction(isActive: boolean): {
    action: string;
    buttonText: string;
    buttonType: 'default' | 'primary';
    icon: string;
    tooltip: string;
  } {
    if (isActive) {
      return {
        action: 'deactivate',
        buttonText: 'Deactivate',
        buttonType: 'default',
        icon: 'pause',
        tooltip: 'Deactivate solution',
      };
    } else {
      return {
        action: 'activate',
        buttonText: 'Activate',
        buttonType: 'primary',
        icon: 'play-circle',
        tooltip: 'Activate solution',
      };
    }
  }
}
