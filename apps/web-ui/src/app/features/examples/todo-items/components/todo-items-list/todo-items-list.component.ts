import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TodoItemsService, TodoItemFilters } from '../../services/todo-items.service';
import { TodoItemDto, SubItemDto } from '@monorepo-kit/types';

@Component({
  selector: 'app-todo-items-list',
  standalone: false,
  templateUrl: './todo-items-list.component.html',
  styleUrls: ['./todo-items-list.component.less'],
})
export class TodoItemsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  todoItems: TodoItemDto[] = [];
  loading = false;
  searchQuery = '';

  // Filters
  selectedStatus = '';
  selectedAssignee = '';
  selectedTags: string[] = [];

  // Table configuration
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  // Status counts
  statusCounts = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    archived: 0,
  };

  // Available options for filters
  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Archived', value: 'archived' },
  ];

  constructor(
    private todoItemsService: TodoItemsService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService,
  ) {}

  ngOnInit(): void {
    this.loadTodoItems();
    this.loadStatusCounts();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToLoading(): void {
    this.todoItemsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  private loadTodoItems(): void {
    const filters: TodoItemFilters = {};
    if (this.selectedStatus) filters.status = this.selectedStatus as any;
    if (this.selectedAssignee) filters.assignedTo = this.selectedAssignee;
    if (this.selectedTags.length > 0) filters.tags = this.selectedTags;

    this.todoItemsService
      .getTodoItems(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.todoItems = items;
          this.total = items.length;
        },
        error: (error) => {
          this.message.error('Failed to load todo items');
          console.error('Load error:', error);
        },
      });
  }

  private loadStatusCounts(): void {
    this.todoItemsService
      .getCountByStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((counts) => {
        this.statusCounts = {
          pending: counts['pending'] || 0,
          in_progress: counts['in_progress'] || 0,
          completed: counts['completed'] || 0,
          archived: counts['archived'] || 0,
        };
      });
  }

  onSearch(): void {
    this.loadTodoItems();
  }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.loadTodoItems();
  }

  onPageChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadTodoItems();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.loadTodoItems();
  }

  openCreateModal(): void {
    this.router.navigate(['/todo-items/new']);
  }

  openEditModal(item: TodoItemDto): void {
    this.router.navigate(['/todo-items', item.id, 'edit']);
  }

  deleteTodoItem(item: TodoItemDto): void {
    this.modal.confirm({
      nzTitle: 'Delete Todo Item',
      nzContent: `Are you sure you want to delete "${item.title}"?`,
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.todoItemsService
          .deleteTodoItem(item.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.message.success('Todo item deleted successfully');
              this.loadTodoItems();
              this.loadStatusCounts();
            },
            error: (error) => {
              this.message.error('Failed to delete todo item');
              console.error('Delete error:', error);
            },
          });
      },
    });
  }

  getStatusColor(status: string): string {
    const colors = {
      pending: 'orange',
      in_progress: 'blue',
      completed: 'green',
      archived: 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  }

  getPriorityColor(priority: number): string {
    if (priority >= 3) return 'red';
    if (priority >= 2) return 'orange';
    if (priority >= 1) return 'blue';
    return 'default';
  }

  getSubItemsPreview(subItems: SubItemDto[]): string {
    if (!subItems || subItems.length === 0) return 'No sub-items';

    const preview = subItems
      .slice(0, 2)
      .map((item) => {
        switch (item.type) {
          case 'text':
            return `📝 ${(item as any).content.substring(0, 30)}${(item as any).content.length > 30 ? '...' : ''}`;
          case 'number':
            return `🔢 ${(item as any).value}${(item as any).unit ? ' ' + (item as any).unit : ''}`;
          case 'checklist': {
            const completed = (item as any).items.filter((i: any) => i.completed).length;
            return `✅ ${completed}/${(item as any).items.length} completed`;
          }
          case 'link':
            return `🔗 ${(item as any).title || (item as any).url}`;
          case 'date':
            return `📅 ${new Date((item as any).date).toLocaleDateString()}`;
          default:
            return '';
        }
      })
      .join(', ');

    const remaining = subItems.length - 2;
    return remaining > 0 ? `${preview} (+${remaining} more)` : preview;
  }

  trackByFn(index: number, item: TodoItemDto): string {
    return item.id;
  }

  isOverdue(item: TodoItemDto): boolean {
    if (!item.dueDate) return false;
    const now = new Date();
    return item.dueDate < now && (item.status === 'pending' || item.status === 'in_progress');
  }
}
