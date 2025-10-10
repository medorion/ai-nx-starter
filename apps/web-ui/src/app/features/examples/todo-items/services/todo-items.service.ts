import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map, tap, finalize } from 'rxjs/operators';
import { TodoItemDto, CreateTodoItemDto, UpdateTodoItemDto, SubItemDto } from '@monorepo-kit/types';
import { ApiTodoItemService } from '@monorepo-kit/api-client';

export interface TodoItemFilters {
  status?: 'pending' | 'in_progress' | 'completed' | 'archived';
  assignedTo?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TodoItemsService {
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  // Read-only observable
  readonly loading$ = this._loading$.asObservable();

  // Synchronous getter
  get isLoading(): boolean {
    return this._loading$.value;
  }

  constructor(private apiTodoItemService: ApiTodoItemService) {}

  /**
   * Get all todo items with optional filtering
   */
  getTodoItems(filters?: TodoItemFilters): Observable<TodoItemDto[]> {
    this._loading$.next(true);

    return this.apiTodoItemService
      .findAll(
        undefined, // limit
        undefined, // offset
        filters?.status,
        filters?.assignedTo,
        filters?.tags,
      )
      .pipe(finalize(() => this._loading$.next(false)));
  }

  /**
   * Get todo item by ID
   */
  getTodoItemById(id: string): Observable<TodoItemDto> {
    this._loading$.next(true);

    return this.apiTodoItemService.findById(id).pipe(finalize(() => this._loading$.next(false)));
  }

  /**
   * Create new todo item
   */
  createTodoItem(todoItem: CreateTodoItemDto): Observable<TodoItemDto> {
    this._loading$.next(true);

    return this.apiTodoItemService.create(todoItem).pipe(finalize(() => this._loading$.next(false)));
  }

  /**
   * Update existing todo item
   */
  updateTodoItem(id: string, updates: UpdateTodoItemDto): Observable<TodoItemDto> {
    this._loading$.next(true);

    return this.apiTodoItemService.update(id, updates).pipe(finalize(() => this._loading$.next(false)));
  }

  /**
   * Delete todo item
   */
  deleteTodoItem(id: string): Observable<void> {
    this._loading$.next(true);

    return this.apiTodoItemService.delete(id).pipe(finalize(() => this._loading$.next(false)));
  }

  /**
   * Get count by status
   */
  getCountByStatus(): Observable<Record<string, number>> {
    this._loading$.next(true);

    const statusList: ('pending' | 'in_progress' | 'completed' | 'archived')[] = ['pending', 'in_progress', 'completed', 'archived'];

    const countRequests = statusList.map((status) =>
      this.apiTodoItemService.getCount(status).pipe(map((response) => ({ status, count: response.count }))),
    );

    return forkJoin(countRequests).pipe(
      map((results) => {
        const counts: Record<string, number> = {};
        results.forEach((result) => {
          counts[result.status] = result.count;
        });
        return counts;
      }),
      finalize(() => this._loading$.next(false)),
    );
  }

  /**
   * Get overdue todo items
   */
  getOverdueTodoItems(): Observable<TodoItemDto[]> {
    this._loading$.next(true);

    return this.apiTodoItemService.getOverdueTodos().pipe(finalize(() => this._loading$.next(false)));
  }
}
