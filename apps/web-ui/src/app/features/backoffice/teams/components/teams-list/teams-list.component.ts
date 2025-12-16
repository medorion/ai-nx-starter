import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TeamsService } from '../../services/teams.service';
import { ClientTeamDto } from '@ai-nx-starter/types';
import { TeamFormComponent } from '../team-form/team-form.component';

@Component({
  selector: 'app-teams-list',
  standalone: false,
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.less'],
})
export class TeamsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  teams: ClientTeamDto[] = [];
  filteredTeams: ClientTeamDto[] = [];
  loading = false;
  searchQuery = '';

  // Table configuration
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  constructor(
    private teamsService: TeamsService,
    private message: NzMessageService,
    private modal: NzModalService,
  ) {}

  ngOnInit(): void {
    this.loadTeams();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTeams(): void {
    this.teamsService
      .getTeams()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teams: ClientTeamDto[]) => {
          this.teams = teams;
          this.applySearch();
        },
        error: (error: any) => {
          this.message.error('Failed to load teams');
          console.error('Error loading teams:', error);
        },
      });
  }

  private subscribeToLoading(): void {
    this.teamsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  onSearch(): void {
    this.applySearch();
  }

  private applySearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTeams = [...this.teams];
    } else {
      this.filteredTeams = this.teams.filter(
        (team) =>
          team.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          team.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          team.owner?.email?.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
    }
    this.total = this.filteredTeams.length;
    this.pageIndex = 1; // Reset to first page when searching
  }

  onCreateTeam(): void {
    const modal = this.modal.create({
      nzTitle: 'Create Team',
      nzContent: TeamFormComponent,
      nzData: { team: null },
      nzFooter: null,
      nzWidth: 600,
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.loadTeams(); // Refresh the list
      }
    });
  }

  onEditTeam(team: ClientTeamDto): void {
    const modal = this.modal.create({
      nzTitle: 'Edit Team',
      nzContent: TeamFormComponent,
      nzData: { team },
      nzFooter: null,
      nzWidth: 600,
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.loadTeams(); // Refresh the list
      }
    });
  }

  onDeleteTeam(team: ClientTeamDto): void {
    this.teamsService
      .deleteTeam(team.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Team deleted successfully');
          this.loadTeams(); // Refresh the list
        },
        error: (error: Error) => {
          this.message.error('Failed to delete team');
          console.error('Error deleting team:', error);
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

  // Get paginated data for current page
  get paginatedTeams(): ClientTeamDto[] {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTeams.slice(startIndex, endIndex);
  }
}
