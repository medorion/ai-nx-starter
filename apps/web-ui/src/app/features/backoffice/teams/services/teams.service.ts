import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { ClientTeamDto, CreateTeamDto, UpdateTeamDto, AddMemberDto } from '@ai-nx-starter/types';
import { ApiTeamService } from '@ai-nx-starter/api-client';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiTeamService: ApiTeamService) {}

  getTeams(limit?: number, offset?: number): Observable<ClientTeamDto[]> {
    this.loadingSubject.next(true);
    return this.apiTeamService.findAll(limit, offset).pipe(finalize(() => this.loadingSubject.next(false)));
  }

  getTeamById(id: string): Observable<ClientTeamDto> {
    this.loadingSubject.next(true);
    return this.apiTeamService.findById(id).pipe(finalize(() => this.loadingSubject.next(false)));
  }

  createTeam(createTeamDto: CreateTeamDto): Observable<ClientTeamDto> {
    this.loadingSubject.next(true);
    return this.apiTeamService.create(createTeamDto).pipe(finalize(() => this.loadingSubject.next(false)));
  }

  updateTeam(id: string, updateTeamDto: UpdateTeamDto): Observable<ClientTeamDto> {
    this.loadingSubject.next(true);
    return this.apiTeamService.update(id, updateTeamDto).pipe(finalize(() => this.loadingSubject.next(false)));
  }

  deleteTeam(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.apiTeamService.delete(id).pipe(finalize(() => this.loadingSubject.next(false)));
  }

  addMember(teamId: string, userId: string): Observable<ClientTeamDto> {
    this.loadingSubject.next(true);
    const addMemberDto: AddMemberDto = { userId };
    return this.apiTeamService.addMember(teamId, addMemberDto).pipe(finalize(() => this.loadingSubject.next(false)));
  }

  removeMember(teamId: string, userId: string): Observable<ClientTeamDto> {
    this.loadingSubject.next(true);
    return this.apiTeamService.removeMember(teamId, userId).pipe(finalize(() => this.loadingSubject.next(false)));
  }
}
