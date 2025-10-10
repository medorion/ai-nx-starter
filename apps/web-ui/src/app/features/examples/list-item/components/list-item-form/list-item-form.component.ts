import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ListItemsService } from '../../services/list-items.service';
import { ExampleDto } from '@monorepo-kit/types';
import { FormGroupService } from '../../../../../core/services/form-group.service';

@Component({
  selector: 'app-list-item-form',
  standalone: false,
  templateUrl: './list-item-form.component.html',
  styleUrls: ['./list-item-form.component.less'],
})
export class ListItemFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  listItemForm!: FormGroup;
  loading = false;
  isEditMode = false;
  listItemId: string | null = null;
  pageTitle = 'Add List Item';

  // Tag input
  tagInputValue = '';
  tags: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listItemsService: ListItemsService,
    private message: NzMessageService,
    private formGroupService: FormGroupService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkRouteParams();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    // Use the FormGroupService to create form with validators based on ExampleDto decorators
    this.listItemForm = this.formGroupService.createFormGroup(ExampleDto);
  }

  private checkRouteParams(): void {
    this.listItemId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.listItemId;
    this.pageTitle = this.isEditMode ? 'Edit List Item' : 'Add List Item';

    if (this.isEditMode && this.listItemId) {
      this.loadListItem(this.listItemId);
    } else {
      // Force form validation to display error messages when creating new item
      this.listItemForm.markAllAsTouched();
      this.listItemForm.updateValueAndValidity();
    }
  }

  private subscribeToLoading(): void {
    this.listItemsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  private loadListItem(id: string): void {
    this.listItemsService
      .getListItemById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (listItem: ExampleDto | null) => {
          if (listItem) {
            this.populateForm(listItem);
          } else {
            this.message.error('List item not found');
            this.navigateToList();
          }
        },
        error: (error: Error) => {
          this.message.error('Failed to load list item');
          console.error('Error loading list item:', error);
          this.navigateToList();
        },
      });
  }

  private populateForm(listItem: ExampleDto): void {
    this.listItemForm.patchValue({
      name: listItem.name,
      age: listItem.age,
      email: listItem.email || '',
    });
    this.tags = listItem.tags || [];
  }

  onSubmit(): void {
    if (this.listItemForm.valid) {
      const formValue = this.listItemForm.value;
      const memberData = {
        ...formValue,
        tags: this.tags,
      };

      if (this.isEditMode && this.listItemId) {
        this.updateListItem(this.listItemId, memberData);
      } else {
        this.createListItem(memberData);
      }
    } else {
      this.markFormGroupTouched();
      this.message.warning('Please fill in all required fields correctly');
    }
  }

  private createListItem(listItemData: Omit<ExampleDto, 'id'>): void {
    this.listItemsService
      .createMember(listItemData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (listItem: ExampleDto) => {
          this.message.success('List item created successfully');
          this.navigateToList();
        },
        error: (error: Error) => {
          this.message.error('Failed to create list item');
          console.error('Error creating list item:', error);
        },
      });
  }

  private updateListItem(id: string, listItemData: Partial<ExampleDto>): void {
    this.listItemsService
      .updateListItem(id, listItemData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (listItem: ExampleDto) => {
          this.message.success('List item updated successfully');
          this.navigateToList();
        },
        error: (error: Error) => {
          this.message.error('Failed to update list item');
          console.error('Error updating list item:', error);
        },
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.listItemForm.controls).forEach((key) => {
      const control = this.listItemForm.get(key);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  onCancel(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    this.router.navigate(['/examples/members']);
  }

  // Tag management methods
  onAddTag(): void {
    const tag = this.tagInputValue.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.tagInputValue = '';
    }
  }

  onRemoveTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  onTagInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onAddTag();
    }
  }

  // Helper methods for form validation display
  isFieldInvalid(fieldName: string): boolean {
    return !this.formGroupService.isControlValid(fieldName, this.listItemForm);
  }

  getFieldError(fieldName: string): string {
    return this.formGroupService.getControlError(fieldName, this.listItemForm);
  }

  // Helper method to get tag color
  getTagColor(index: number): string {
    const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan'];
    return colors[index % colors.length];
  }
}
