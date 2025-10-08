import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';
import { TodoItemDto, CreateTodoItemDto, UpdateTodoItemDto, SubItemDto, ChecklistItemDto } from '@medorion/types';
import { TodoItemsService } from '../../services/todo-items.service';
import { FormGroupService } from '../../../../../core/services/form-group.service';

@Component({
  selector: 'app-todo-item-form',
  standalone: false,
  templateUrl: './todo-item-form.component.html',
  styleUrls: ['./todo-item-form.component.less'],
})
export class TodoItemFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form: FormGroup;
  isEditMode = false;
  loading = false;
  todoItemId: string | null = null;
  pageTitle = 'Add Todo Item';

  // Sub-item type options
  subItemTypes = [
    { label: 'Text', value: 'text', icon: 'file-text' },
    { label: 'Number', value: 'number', icon: 'number' },
    { label: 'Checklist', value: 'unordered-list', icon: 'unordered-list' },
    { label: 'Link', value: 'link', icon: 'link' },
    { label: 'Date', value: 'date', icon: 'calendar' },
  ];

  // Status options
  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Archived', value: 'archived' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private todoItemsService: TodoItemsService,
    private message: NzMessageService,
    private formGroupService: FormGroupService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkRouteParams();
    this.subscribeToLoading();
  }

  private checkRouteParams(): void {
    this.todoItemId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.todoItemId;
    this.pageTitle = this.isEditMode ? 'Edit Todo Item' : 'Add Todo Item';

    if (this.isEditMode && this.todoItemId) {
      this.loadTodoItem(this.todoItemId);
    } else {
      // Force form validation to display error messages when creating new item
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
    }
  }

  private subscribeToLoading(): void {
    this.todoItemsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  private loadTodoItem(id: string): void {
    this.todoItemsService
      .getTodoItemById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (todoItem) => {
          if (todoItem) {
            this.loadFormData(todoItem);
          } else {
            this.message.error('Todo item not found');
            this.navigateToList();
          }
        },
        error: (error) => {
          this.message.error('Failed to load todo item');
          console.error('Error loading todo item:', error);
          this.navigateToList();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    // Use FormGroupService to create form with automatic validation from DTO
    this.form = this.formGroupService.createFormGroup(CreateTodoItemDto, {
      title: '',
      description: '',
      status: 'pending',
      priority: 0,
      dueDate: undefined,
      assignedTo: '',
      tags: [],
    });

    // Add subItems FormArray manually since it's complex nested structure
    this.form.addControl('subItems', this.fb.array([]));
  }

  private loadFormData(todoItem: TodoItemDto): void {
    this.form.patchValue({
      title: todoItem.title,
      description: todoItem.description,
      status: todoItem.status,
      priority: todoItem.priority,
      dueDate: todoItem.dueDate ? new Date(todoItem.dueDate) : null,
      assignedTo: todoItem.assignedTo,
      tags: todoItem.tags,
    });

    // Load sub-items
    const subItemsArray = this.form.get('subItems') as FormArray;
    todoItem.subItems.forEach((subItem) => {
      subItemsArray.push(this.createSubItemFormGroup(subItem));
    });
  }

  get subItemsArray(): FormArray {
    return this.form.get('subItems') as FormArray;
  }

  createSubItemFormGroup(subItem?: SubItemDto): FormGroup {
    const baseGroup = this.fb.group({
      type: [subItem?.type || 'text', [Validators.required]],
      metadata: [subItem?.metadata || {}],
    });

    // Add type-specific controls based on the sub-item type
    const type = subItem?.type || 'text';
    this.addTypeSpecificControls(baseGroup, type, subItem);

    // Subscribe to type changes to update controls
    baseGroup.get('type')?.valueChanges.subscribe((newType) => {
      if (newType) {
        this.addTypeSpecificControls(baseGroup, newType);
      }
    });

    return baseGroup;
  }

  private addTypeSpecificControls(group: FormGroup, type: string, subItem?: SubItemDto): void {
    // Remove existing type-specific controls
    ['content', 'value', 'unit', 'items', 'url', 'title', 'date', 'timezone'].forEach((control) => {
      if (group.contains(control)) {
        group.removeControl(control);
      }
    });

    switch (type) {
      case 'text':
        group.addControl('content', this.fb.control((subItem as any)?.content || '', [Validators.required, Validators.maxLength(500)]));
        break;

      case 'number':
        group.addControl(
          'value',
          this.fb.control((subItem as any)?.value || 0, [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]),
        );
        group.addControl('unit', this.fb.control((subItem as any)?.unit || ''));
        break;

      case 'checklist': {
        const existingItems = (subItem as any)?.items || [];
        const checklistItems = this.fb.array(
          existingItems.map((item: ChecklistItemDto) =>
            this.fb.group({
              id: [item.id || this.generateId()],
              text: [item.text, [Validators.required, Validators.maxLength(200)]],
              completed: [item.completed || false],
            }),
          ),
        );
        group.addControl('items', checklistItems);
        break;
      }

      case 'link':
        group.addControl('url', this.fb.control((subItem as any)?.url || '', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]));
        group.addControl('title', this.fb.control((subItem as any)?.title || ''));
        break;

      case 'date':
        group.addControl('date', this.fb.control((subItem as any)?.date ? new Date((subItem as any).date) : null, [Validators.required]));
        group.addControl('timezone', this.fb.control((subItem as any)?.timezone || ''));
        break;
    }
  }

  addSubItem(): void {
    this.subItemsArray.push(this.createSubItemFormGroup());
  }

  removeSubItem(index: number): void {
    this.subItemsArray.removeAt(index);
  }

  getChecklistItems(subItemIndex: number): FormArray {
    return this.subItemsArray.at(subItemIndex).get('items') as FormArray;
  }

  addChecklistItem(subItemIndex: number): void {
    const checklistItems = this.getChecklistItems(subItemIndex);
    checklistItems.push(
      this.fb.group({
        id: [this.generateId()],
        text: ['', [Validators.required, Validators.maxLength(200)]],
        completed: [false],
      }),
    );
  }

  removeChecklistItem(subItemIndex: number, itemIndex: number): void {
    const checklistItems = this.getChecklistItems(subItemIndex);
    checklistItems.removeAt(itemIndex);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      this.message.error('Please check all required fields');
      return;
    }

    if (this.isEditMode && this.todoItemId) {
      const updateData = this.prepareFormValue() as UpdateTodoItemDto;
      this.updateTodoItem(this.todoItemId, updateData);
    } else {
      const createData = this.prepareFormValue() as CreateTodoItemDto;
      this.createTodoItem(createData);
    }
  }

  private createTodoItem(todoItemData: CreateTodoItemDto): void {
    this.todoItemsService
      .createTodoItem(todoItemData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (todoItem) => {
          this.message.success(`Todo item "${todoItem.title}" created successfully`);
          this.navigateToList();
        },
        error: (error) => {
          this.message.error('Failed to create todo item');
          console.error('Error creating todo item:', error);
        },
      });
  }

  private updateTodoItem(id: string, todoItemData: UpdateTodoItemDto): void {
    this.todoItemsService
      .updateTodoItem(id, todoItemData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (todoItem) => {
          this.message.success(`Todo item "${todoItem.title}" updated successfully`);
          this.navigateToList();
        },
        error: (error) => {
          this.message.error('Failed to update todo item');
          console.error('Error updating todo item:', error);
        },
      });
  }

  onCancel(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    this.router.navigate(['/todo-items']);
  }

  private prepareFormValue(): CreateTodoItemDto | UpdateTodoItemDto {
    const formValue = this.form.value;

    // Transform sub-items to match the expected format
    const subItems: SubItemDto[] = formValue.subItems.map((subItem: any) => {
      const baseSubItem = {
        type: subItem.type,
        metadata: subItem.metadata,
      };

      switch (subItem.type) {
        case 'text':
          return { ...baseSubItem, content: subItem.content };
        case 'number':
          return { ...baseSubItem, value: subItem.value, unit: subItem.unit };
        case 'checklist':
          return { ...baseSubItem, items: subItem.items };
        case 'link':
          return { ...baseSubItem, url: subItem.url, title: subItem.title };
        case 'date':
          return { ...baseSubItem, date: subItem.date, timezone: subItem.timezone };
        default:
          return baseSubItem;
      }
    });

    return {
      ...formValue,
      subItems,
      tags: formValue.tags || [],
    };
  }

  private markAllFieldsAsTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          this.markFormGroupAsTouched(arrayControl as FormGroup);
        });
      }
    });
  }

  private markFormGroupAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupAsTouched(control);
      }
      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          this.markFormGroupAsTouched(arrayControl as FormGroup);
        });
      }
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    return !this.formGroupService.isControlValid(fieldName, this.form);
  }

  getFieldError(fieldName: string): string {
    return this.formGroupService.getControlError(fieldName, this.form);
  }
}
