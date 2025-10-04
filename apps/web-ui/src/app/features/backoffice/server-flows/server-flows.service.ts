import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiSyncServiceFlowService } from '@medorion/api-client';
import { SyncServiceFlowDto, SyncServiceFlowSearchOptionsDto, QueryResultDto, IMdWorkflow } from '@medorion/types';

@Injectable({
  providedIn: 'root',
})
export class ServerFlowsService {
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean> = this._loading$.asObservable();

  constructor(private readonly apiSyncServiceFlowService: ApiSyncServiceFlowService) {}

  searchFlows(options: SyncServiceFlowSearchOptionsDto): Observable<QueryResultDto<SyncServiceFlowDto>> {
    this._loading$.next(true);
    return this.apiSyncServiceFlowService.search(options).pipe(finalize(() => this._loading$.next(false)));
  }

  getFlowById(id: string, includeFlowDefinition = false): Observable<SyncServiceFlowDto> {
    this._loading$.next(true);
    return this.apiSyncServiceFlowService.findById(id, includeFlowDefinition).pipe(finalize(() => this._loading$.next(false)));
  }

  getFlowWithWorkflow(id: string): Observable<{ flow: SyncServiceFlowDto | null; workflow: IMdWorkflow | null }> {
    this._loading$.next(true);
    return this.apiSyncServiceFlowService.findByIdWithParsedWorkflow(id).pipe(finalize(() => this._loading$.next(false)));
  }
}
