import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiOrganizationsService } from '@medorion/api-client';
import { OrganizationDto, OrganizationStatus, UpdateOrganizationDataDto } from '@medorion/types';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean> = this._loading$.asObservable();

  constructor(private readonly apiOrganizationsService: ApiOrganizationsService) {}

  getOrganizations(): Observable<OrganizationDto[]> {
    this._loading$.next(true);
    return this.apiOrganizationsService.findAll().pipe(finalize(() => this._loading$.next(false)));
  }

  getOrganizationById(id: string): Observable<OrganizationDto> {
    this._loading$.next(true);
    return this.apiOrganizationsService.findById(id).pipe(finalize(() => this._loading$.next(false)));
  }

  createOrganization(organizationData: OrganizationDto): Observable<OrganizationDto> {
    this._loading$.next(true);
    return this.apiOrganizationsService.create(organizationData).pipe(finalize(() => this._loading$.next(false)));
  }

  updateOrganization(id: string, updateData: UpdateOrganizationDataDto): Observable<OrganizationDto> {
    this._loading$.next(true);
    return this.apiOrganizationsService.update(id, updateData).pipe(finalize(() => this._loading$.next(false)));
  }

  updateOrganizationStatus(id: string, status: OrganizationStatus): Observable<OrganizationDto> {
    this._loading$.next(true);
    return this.apiOrganizationsService.updateStatus(id, status).pipe(finalize(() => this._loading$.next(false)));
  }

  deleteOrganization(id: string): Observable<{ deleted: boolean }> {
    this._loading$.next(true);
    return this.apiOrganizationsService.delete(id).pipe(finalize(() => this._loading$.next(false)));
  }
}
