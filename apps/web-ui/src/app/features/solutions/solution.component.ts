import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UIAppContextService } from '../../core/services/ui-app-context.service';
import { IdNameDto } from '@medorion/types';

@Component({
  selector: 'app-solution',
  standalone: false,
  templateUrl: './solution.component.html',
  styleUrl: './solution.component.less',
})
export class SolutionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  solutionId: string | null = null;
  solutionName: string | null = null;
  isCollapsed = false;
  private solutions: IdNameDto[] = [];

  constructor(
    private route: ActivatedRoute,
    private uiAppContextService: UIAppContextService,
  ) {}

  ngOnInit(): void {
    // Subscribe to solutions data
    this.uiAppContextService.availableSolutions$.pipe(takeUntil(this.destroy$)).subscribe((solutions: IdNameDto[]) => {
      this.solutions = solutions;
      this.updateSolutionName();
    });

    // Subscribe to route params
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.solutionId = params['solutionId'] || null;
      this.updateSolutionName();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSolutionName(): void {
    if (this.solutionId && this.solutions.length > 0) {
      const solution = this.solutions.find((s) => s.id === this.solutionId);
      this.solutionName = solution?.name || null;
    } else {
      this.solutionName = null;
    }
  }
}
