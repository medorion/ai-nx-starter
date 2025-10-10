import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ExampleDto } from '@monorepo-kit/types';
import { ApiExampleService } from '@monorepo-kit/api-client';

@Injectable({
  providedIn: 'root',
})
export class ListItemsService {
  private listItemsSubject = new BehaviorSubject<ExampleDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public listItems$ = this.listItemsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private exampleService: ApiExampleService) {
    // Load initial data from API
    this.loadListItemsFromApi();
  }

  private loadListItemsFromApi(): void {
    this.loadingSubject.next(true);
    from(this.exampleService.findAll(''))
      .pipe(
        tap((members) => {
          this.listItemsSubject.next(members);
          this.loadingSubject.next(false);
        }),
        catchError((error) => {
          console.error('Failed to load members:', error);
          this.loadingSubject.next(false);
          return throwError(() => error);
        }),
      )
      .subscribe();
  }

  /**
   * Get all members
   */
  getListItems(): Observable<ExampleDto[]> {
    this.loadingSubject.next(true);

    return from(this.exampleService.findAll('')).pipe(
      tap((members) => {
        this.listItemsSubject.next(members);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Failed to get list items:', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Get list item by ID
   */
  getListItemById(id: string): Observable<ExampleDto | null> {
    this.loadingSubject.next(true);

    return from(this.exampleService.findOne(id)).pipe(
      map((member) => {
        this.loadingSubject.next(false);
        return member;
      }),
      catchError((error) => {
        console.error('Failed to get member by ID:', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Create new member
   */
  createMember(memberData: Omit<ExampleDto, 'id'>): Observable<ExampleDto> {
    this.loadingSubject.next(true);

    return from(this.exampleService.create(memberData)).pipe(
      tap((member) => {
        const currentMembers = this.listItemsSubject.value;
        this.listItemsSubject.next([...currentMembers, member]);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Failed to create member:', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Update existing member
   */
  updateListItem(id: string, memberData: Partial<ExampleDto>): Observable<ExampleDto> {
    this.loadingSubject.next(true);

    const currentMembers = this.listItemsSubject.value;
    const existingMember = currentMembers.find((m) => m.id === id);

    if (!existingMember) {
      this.loadingSubject.next(false);
      return throwError(() => new Error(`Member with id ${id} not found`));
    }

    const updatedMemberData = { ...existingMember, ...memberData, id };

    return from(this.exampleService.update(id, updatedMemberData)).pipe(
      tap((member) => {
        const memberIndex = currentMembers.findIndex((m) => m.id === id);
        if (memberIndex !== -1) {
          const updatedMembers = [...currentMembers];
          updatedMembers[memberIndex] = member;
          this.listItemsSubject.next(updatedMembers);
        }
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Failed to update member:', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Delete member
   */
  deleteListItem(id: string): Observable<boolean> {
    this.loadingSubject.next(true);

    const currentMembers = this.listItemsSubject.value;
    const memberExists = currentMembers.some((m) => m.id === id);

    if (!memberExists) {
      this.loadingSubject.next(false);
      return throwError(() => new Error(`Member with id ${id} not found`));
    }

    return from(this.exampleService.remove(id)).pipe(
      map(() => {
        const filteredMembers = currentMembers.filter((m) => m.id !== id);
        this.listItemsSubject.next(filteredMembers);
        this.loadingSubject.next(false);
        return true;
      }),
      catchError((error) => {
        console.error('Failed to delete member:', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Search members by name
   */
  searchMembers(query: string): Observable<ExampleDto[]> {
    if (!query.trim()) {
      return this.listItems$;
    }

    this.loadingSubject.next(true);

    return from(this.exampleService.findAll(query)).pipe(
      tap((members) => {
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Failed to search members:', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
    );
  }
}
