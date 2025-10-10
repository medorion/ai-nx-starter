import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ClientUserDto, CreateUserDto, UpdateUserDto } from '@monorepo-kit/types';
import { ApiUserService } from '@monorepo-kit/api-client';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiUserService: ApiUserService) {}

  getUsers(limit?: number, offset?: number): Observable<ClientUserDto[]> {
    this.loadingSubject.next(true);
    return this.apiUserService.findAll(limit, offset).pipe(tap(() => this.loadingSubject.next(false)));
  }

  getUserById(id: string): Observable<ClientUserDto> {
    this.loadingSubject.next(true);
    return this.apiUserService.findById(id).pipe(tap(() => this.loadingSubject.next(false)));
  }

  getUserByEmail(email: string): Observable<ClientUserDto> {
    this.loadingSubject.next(true);
    return this.apiUserService.findByEmail(email).pipe(tap(() => this.loadingSubject.next(false)));
  }

  getCount(): Observable<{ count: number }> {
    return this.apiUserService.getCount();
  }

  createUser(createUserDto: CreateUserDto): Observable<ClientUserDto> {
    this.loadingSubject.next(true);
    return this.apiUserService.create(createUserDto).pipe(tap(() => this.loadingSubject.next(false)));
  }

  updateUser(id: string, updateUserDto: UpdateUserDto): Observable<ClientUserDto> {
    this.loadingSubject.next(true);
    return this.apiUserService.update(id, updateUserDto).pipe(tap(() => this.loadingSubject.next(false)));
  }

  deleteUser(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.apiUserService.delete(id).pipe(tap(() => this.loadingSubject.next(false)));
  }
}
