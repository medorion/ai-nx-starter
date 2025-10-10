import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ListItemsService } from '../../services/list-items.service';
import { ExampleDto } from '@monorepo-kit/types';

@Component({
  selector: 'app-list-items',
  standalone: false,
  templateUrl: './list-items.component.html',
  styleUrls: ['./list-items.component.less'],
})
export class ListItemsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  listItems: ExampleDto[] = [];
  filteredListItems: ExampleDto[] = [];
  loading = false;
  searchQuery = '';

  // Table configuration
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  constructor(
    private listItemsService: ListItemsService,
    private router: Router,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadListItems();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadListItems(): void {
    this.listItemsService
      .getListItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members: ExampleDto[]) => {
          this.listItems = members;
          this.applySearch();
        },
        error: (error: any) => {
          this.message.error('Failed to load members');
          console.error('Error loading listItems:', error);
        },
      });
  }

  private subscribeToLoading(): void {
    this.listItemsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  onSearch(): void {
    this.applySearch();
  }

  private applySearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredListItems = [...this.listItems];
    } else {
      this.filteredListItems = this.listItems.filter(
        (member) =>
          member.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          member.email?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          member.tags.some((tag) => tag.toLowerCase().includes(this.searchQuery.toLowerCase())),
      );
    }
    this.total = this.filteredListItems.length;
    this.pageIndex = 1; // Reset to first page when searching
  }

  onCreateMember(): void {
    this.router.navigate(['/examples/list-items/new']);
  }

  onEditListItem(member: ExampleDto): void {
    this.router.navigate(['/examples/list-items', member.id, 'edit']);
  }

  onDeleteListItem(member: ExampleDto): void {
    this.listItemsService
      .deleteListItem(member.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('List item deleted successfully');
          this.loadListItems(); // Refresh the list
        },
        error: (error: Error) => {
          this.message.error('Failed to delete list item');
          console.error('Error deleting list item:', error);
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
  get paginatedListItems(): ExampleDto[] {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredListItems.slice(startIndex, endIndex);
  }

  // Helper method to get tag color
  getTagColor(index: number): string {
    const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan'];
    return colors[index % colors.length];
  }
}
