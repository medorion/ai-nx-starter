import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiSolutionsService } from '@medorion/api-client';
import { SolutionDto } from '@medorion/types';

@Injectable({
  providedIn: 'root',
})
export class SolutionsService {
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean> = this._loading$.asObservable();

  constructor(private readonly apiSolutionsService: ApiSolutionsService) {}

  getSolutions(): Observable<SolutionDto[]> {
    this._loading$.next(true);
    return this.apiSolutionsService.findByOrgCode().pipe(finalize(() => this._loading$.next(false)));
  }

  getSolutionsByOrgCode(orgCode: string): Observable<SolutionDto[]> {
    this._loading$.next(true);
    return this.apiSolutionsService.findByOrgCode().pipe(finalize(() => this._loading$.next(false)));
  }

  getSolutionById(id: string): Observable<SolutionDto> {
    this._loading$.next(true);
    return this.apiSolutionsService.findById(id).pipe(finalize(() => this._loading$.next(false)));
  }

  createSolution(solutionData: SolutionDto): Observable<SolutionDto> {
    this._loading$.next(true);
    return this.apiSolutionsService.create(solutionData).pipe(finalize(() => this._loading$.next(false)));
  }

  updateSolution(id: string, updateData: Partial<SolutionDto>): Observable<SolutionDto> {
    this._loading$.next(true);
    return this.apiSolutionsService.update(id, updateData as SolutionDto).pipe(finalize(() => this._loading$.next(false)));
  }

  updateSolutionStatus(id: string, isActive: boolean): Observable<SolutionDto> {
    this._loading$.next(true);
    return this.apiSolutionsService.setActiveStatus(id, isActive).pipe(finalize(() => this._loading$.next(false)));
  }

  deleteSolution(id: string): Observable<{ deleted: boolean }> {
    this._loading$.next(true);
    return this.apiSolutionsService.delete(id).pipe(finalize(() => this._loading$.next(false)));
  }
}
