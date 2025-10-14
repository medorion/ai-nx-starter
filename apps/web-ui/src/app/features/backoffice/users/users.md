# Users Feature - Implementation Guide

**Context**: Users management feature in the Angular web-ui application (`apps/web-ui/src/app/features/backoffice/users`)

## Feature Overview

This is a complete CRUD (Create, Read, Update, Delete) implementation for managing users in the backoffice. It serves as a **reference implementation** for other features following the same pattern.

## Architecture Pattern

### Module Structure
```
/users
  /components
    /users-list         ’ List view component
    /user-form          ’ Create/Edit form component
  /services
    users.service.ts    ’ Service layer with state management
  users-routing.module.ts ’ Feature routing
  users.module.ts        ’ Feature module
  users.md               ’ This documentation
```

## Key Components

### 1. List Component (`users-list.component.ts`)

**Purpose**: Display, search, and manage users in a table view

**Key Features**:
- **Table Display**: Uses `nz-table` for data presentation (lines 28-97)
- **Search Functionality**: Client-side filtering by name, email, or role (lines 63-81)
- **Pagination**: Custom pagination with configurable page size (lines 107-124)
- **Actions**: Edit and Delete buttons with confirmation (lines 67-94)
- **Empty State**: Shows appropriate message when no data (lines 100-111)
- **Loading State**: Managed through service subscription (lines 59-61)

**Important Patterns**:
- Uses `paginatedUsers` getter for displaying current page data (lines 117-121)
- Implements `OnDestroy` with `destroy$` Subject for subscription management (lines 15, 38-41)
- Uses `takeUntil(this.destroy$)` to prevent memory leaks
- Avatar with first letter of name (line 50)
- Role-based badge colors (lines 124-133)

**Template Patterns** (`users-list.component.html`):
- Page header with title and action button (lines 3-13)
- Search input with ng-model two-way binding (lines 16-25)
- Table with avatar, name, email, role, phone columns (lines 28-97)
- Action buttons: Edit (tooltip) and Delete (popconfirm) (lines 67-94)
- Empty state with conditional content (lines 100-111)
- Bottom pagination (lines 114-126)

### 2. Form Component (`user-form.component.ts`)

**Purpose**: Single component handling both Create and Edit operations

**Key Features**:
- **Dual Mode**: Detects edit mode from route parameter `:id` (lines 60-72)
- **Reactive Forms**: Uses `FormBuilder` and `Validators` (lines 48-58)
- **Dynamic Validation**: Password required for create, optional for edit (lines 64-68)
- **Form Validation**: Manual validation trigger on submit (lines 101-108)
- **Error Display**: Helper method `isFieldInvalid()` for field-level errors (lines 172-175)
- **Loading States**: Separate `loading` (data fetch) and `submitting` (save) states (lines 21-22)

**Important Patterns**:
- Check route param to determine create vs edit mode (lines 60-62)
- Load existing data in edit mode with `patchValue()` (lines 74-97)
- Remove empty password field before update (lines 142-145)
- Navigate back to list after successful save (lines 128-129, 152-153)
- Mark all fields as dirty to show validation errors (lines 102-107)

**Template Patterns** (`user-form.component.html`):
- Dynamic header based on mode (lines 5-8)
- Form in `nz-card` with vertical layout (lines 22-104)
- All fields use `nz-form-item` structure (lines 25-91)
- Required fields marked with `nzRequired` (lines 26, 34, 42, etc.)
- Error messages via `nzErrorTip` (lines 27, 35, 43, etc.)
- Dynamic password field label and placeholder (lines 50-64)
- Role select with options from enum (lines 68-75)
- Debug section showing form state (lines 108-134) - useful for development

**Styling Patterns** (`user-form.component.less`):
- Two-column layout: form (flex: 1) + debug panel (350px) (lines 27-68)
- Debug section with JSON display and field status (lines 36-68)
- Error state styling for inputs (lines 76-79)
- Uses standard spacing and colors

### 3. Service Layer (`users.service.ts`)

**Purpose**: Wraps API calls and manages loading state

**Key Features**:
- **State Management**: Uses `BehaviorSubject` for loading state (lines 10-11)
- **API Integration**: Delegates to `ApiUserService` from `@monorepo-kit/api-client` (line 4)
- **Loading Indicator**: Sets loading before API call, clears after (lines 15-18)
- **CRUD Operations**: All operations (find, create, update, delete) (lines 15-47)

**Important Patterns**:
- Service is `providedIn: 'root'` (singleton) (lines 6-8)
- Uses RxJS `tap` operator to manage side effects (lines 17, 22, 27, etc.)
- Returns Observables for reactive programming
- All methods use DTOs from `@monorepo-kit/types` package (line 3)

### 4. Routing (`users-routing.module.ts`)

**Routes**:
- `''` ’ List view (`UsersListComponent`)
- `'new'` ’ Create form (`UserFormComponent`)
- `':id/edit'` ’ Edit form (`UserFormComponent`)

**Important**:
- Uses same component for create/edit with different routes (lines 12-21)
- Breadcrumb data for navigation context (lines 10, 15, 20)

### 5. Module Declaration (`users.module.ts`)

**Important Patterns**:
- Imports `ReactiveFormsModule` for reactive forms (line 3)
- Imports `FormsModule` for `[(ngModel)]` in search (line 3)
- Imports all required ng-zorro modules (lines 6-19)
- Imports `SharedModule` for common components/directives (line 26)
- Declares both components (line 32)
- **Non-standalone components** (`standalone: false` in components) (lines 10, 11)

## Styling Patterns

### List Component Styles (`users-list.component.less`)

**Key Patterns**:
- `.inner-container` wrapper for consistent page layout
- `.page-header` with flexbox for title + actions (lines 2-15)
- `.search-section` for search controls (lines 17-19)
- `.user-info` with flex layout for avatar + name (lines 26-30)
- `.action-buttons` with gap for button spacing (lines 36-39)
- `.pagination-container` aligned right (lines 41-45)

### Form Component Styles (`user-form.component.less`)

**Key Patterns**:
- Two-column layout with `display: flex` (lines 27-29)
- Form section is flexible, debug panel is fixed width (lines 31-38)
- `.json-display` for formatted JSON preview (lines 40-47)
- `.field-status-list` for validation status display (lines 49-66)
- Error state styling with red border (lines 76-79)
- Uses ng-zorro color values (`#ff4d4f`, `#52c41a`, etc.)

## Data Flow

### Reading Data (List View)
1. Component calls `usersService.getUsers()` in `ngOnInit()` (line 34, 43-56)
2. Service sets `loading = true` and calls API (lines 15-18)
3. Observable emits data, component stores in `users` array (line 49)
4. Component applies search filter to create `filteredUsers` (line 50, 67-81)
5. Template displays `paginatedUsers` (computed from `filteredUsers`) (line 30)
6. Service sets `loading = false` via `tap` operator (line 17)

### Creating Data (Form)
1. User navigates to `/backoffice/users/new` (via button click)
2. Form component initializes empty form (lines 48-58)
3. User fills form and clicks submit (line 100)
4. Component validates form (lines 101-109)
5. If valid, calls `usersService.createUser()` with DTO (lines 120-136)
6. Service sets `submitting = true` and calls API (line 123-125)
7. On success, shows message and navigates to list (lines 128-129)
8. On error, shows error message (lines 131-135)

### Updating Data (Form)
1. User clicks Edit button in list (line 87-88)
2. Router navigates to `/backoffice/users/:id/edit` (line 88)
3. Form component detects edit mode from route (lines 60-62)
4. Loads user data via `getUserById()` and patches form (lines 74-97)
5. User modifies form and submits (line 100)
6. Component removes empty password if not changed (lines 142-145)
7. Calls `usersService.updateUser()` with DTO (lines 147-160)
8. On success, shows message and navigates to list (lines 152-153)

### Deleting Data (List)
1. User clicks Delete button (line 84)
2. `nz-popconfirm` shows confirmation dialog (lines 83-88)
3. On confirm, calls `usersService.deleteUser()` (lines 91-104)
4. On success, shows message and reloads list (lines 97-98)
5. On error, shows error message (lines 100-103)

## Integration Points

### API Client
- Uses `ApiUserService` from `@monorepo-kit/api-client` package
- **IMPORTANT**: This is auto-generated - do NOT modify API client code
- Service wraps all API calls in the feature service layer

### Types Package
- Uses DTOs: `ClientUserDto`, `CreateUserDto`, `UpdateUserDto` from `@monorepo-kit/types`
- Uses enums: `Role` from `@monorepo-kit/types`
- **MUST** use these shared types for type safety

### Shared Module
- Imports `SharedModule` for common components and directives
- Provides access to shared utilities, pipes, and components

## Ng-Zorro Components Used

### List View
- `nz-table` - Data table with sorting/filtering capability
- `nz-input-group` - Search input with search button
- `nz-button` - Action buttons (Create, Edit, Delete)
- `nz-icon` - Icons for buttons and actions
- `nz-avatar` - User avatar with initials
- `nz-tag` - Role badges with colors
- `nz-tooltip` - Hover tooltips for action buttons
- `nz-popconfirm` - Delete confirmation dialog
- `nz-empty` - Empty state component
- `nz-pagination` - Pagination controls

### Form View
- `nz-card` - Container for form sections
- `nz-form` - Form wrapper with layout
- `nz-form-item` - Individual form field container
- `nz-form-label` - Field labels with required indicator
- `nz-form-control` - Field input wrapper with validation
- `nz-input` - Text input fields
- `nz-select` - Dropdown for role selection
- `nz-button` - Submit and cancel buttons
- `nz-divider` - Visual separator in debug panel

## Reusable Patterns

### 1. Service-Based State Management
```typescript
private loadingSubject = new BehaviorSubject<boolean>(false);
public loading$ = this.loadingSubject.asObservable();
```
Use this pattern for any state that needs to be shared or observed.

### 2. Subscription Management
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(/* ... */);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```
**ALWAYS** implement this pattern to prevent memory leaks.

### 3. Form Validation Pattern
```typescript
onSubmit(): void {
  if (this.form.invalid) {
    Object.values(this.form.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
    return;
  }
  // Proceed with submission
}
```

### 4. Create/Edit Dual Mode Component
```typescript
ngOnInit(): void {
  this.userId = this.route.snapshot.paramMap.get('id');
  this.isEditMode = !!this.userId;

  if (this.isEditMode && this.userId) {
    this.loadData(this.userId);
  }
}
```

### 5. Client-Side Search/Filter
```typescript
private applySearch(): void {
  if (!this.searchQuery.trim()) {
    this.filteredItems = [...this.items];
  } else {
    this.filteredItems = this.items.filter(item =>
      item.field1?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      item.field2?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  this.total = this.filteredItems.length;
  this.pageIndex = 1;
}
```

### 6. Paginated Data Getter
```typescript
get paginatedItems(): T[] {
  const startIndex = (this.pageIndex - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  return this.filteredItems.slice(startIndex, endIndex);
}
```

## Common Customizations

### When Creating a New Feature Based on Users:

1. **Replace Entity Names**:
   - `User` ’ `YourEntity`
   - `users` ’ `yourEntities`
   - Update all file names, class names, and references

2. **Update DTOs**:
   - Import correct DTOs from `@monorepo-kit/types`
   - Update form fields to match your entity properties

3. **Adjust Table Columns**:
   - Modify columns in template (lines 36-44 in users-list.component.html)
   - Update column rendering logic (lines 47-66)

4. **Customize Form Fields**:
   - Add/remove fields based on entity requirements
   - Update validators in `initForm()` method
   - Adjust form layout in template

5. **Update Search Logic**:
   - Modify `applySearch()` to filter by relevant fields (lines 67-81)

6. **Adjust Role/Status Badges**:
   - Update `getRoleBadgeColor()` or create similar methods for your entity
   - Modify badge rendering in template

7. **Configure Routes**:
   - Update route paths in `users-routing.module.ts`
   - Update breadcrumb labels

## Best Practices Demonstrated

1. **Separation of Concerns**: Components handle UI, service handles data/API
2. **Reactive Programming**: Uses Observables throughout
3. **Type Safety**: Strong typing with DTOs and interfaces
4. **Memory Management**: Proper cleanup with `destroy$` Subject
5. **User Feedback**: Messages for success/error, loading states, confirmations
6. **Form Validation**: Client-side validation with clear error messages
7. **Responsive Design**: Flexbox layouts, proper spacing
8. **Accessibility**: Labels, error messages, tooltips
9. **DRY Principle**: Reusable patterns for common operations
10. **Error Handling**: Graceful error handling with user-friendly messages

## File References

- **List Component**: `apps/web-ui/src/app/features/backoffice/users/components/users-list/users-list.component.ts`
- **Form Component**: `apps/web-ui/src/app/features/backoffice/users/components/user-form/user-form.component.ts`
- **Service**: `apps/web-ui/src/app/features/backoffice/users/services/users.service.ts`
- **Routing**: `apps/web-ui/src/app/features/backoffice/users/users-routing.module.ts`
- **Module**: `apps/web-ui/src/app/features/backoffice/users/users.module.ts`

## Notes for Claude Code

When implementing a new feature similar to users:

1. **Follow this exact structure** for consistency
2. **Use the same component patterns** (list + form)
3. **Copy subscription management** approach to prevent leaks
4. **Reuse styling patterns** for consistent UI
5. **Follow the same routing structure** for standard CRUD
6. **Use ng-zorro components** as shown here
7. **Implement loading and error states** as demonstrated
8. **Keep components non-standalone** (`standalone: false`)
9. **Use reactive forms** with proper validation
10. **Test with the debug panel pattern** (can be removed in production)
