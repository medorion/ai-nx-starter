# Styling Guide

Modern styling patterns for Angular 19 with NG-ZORRO components, LESS preprocessing, and theme integration.

---

## Inline vs Separate Styles

### Decision Threshold

**<100 lines: Inline styles in component.less file**

```less
// user-list.component.less
.user-list-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.user-header {
  margin-bottom: 16px;
  border-bottom: 1px solid @border-color-base;
  padding-bottom: 8px;
}

.user-table {
  background: @component-background;
}

// ... ~80 lines of styles
```

**>100 lines: Keep in component.less but organize with comments**

```less
// user-dashboard.component.less

/* ==========================================
   Layout Styles
   ========================================== */
.dashboard-container {
  height: 100%;
  max-height: calc(100vh - 220px);
}

.grid-section {
  height: 100%;
  overflow: auto;
  padding: 32px;
}

/* ==========================================
   Card Styles
   ========================================== */
.stats-card {
  background: @component-background;
  border-radius: @border-radius-base;
}

// ... 100+ lines organized by section
```

**Guideline**: User is comfortable with ~100 lines in a single .less file. Use section comments for organization.

---

## LESS Theme Variables

### Built-in NG-ZORRO Variables

```less
// Available theme variables (from NG-ZORRO)

/* Colors */
@primary-color: #1890ff; // Primary brand color
@success-color: #52c41a;
@warning-color: #faad14;
@error-color: #f5222d;
@info-color: #1890ff;

/* Text */
@text-color: rgba(0, 0, 0, 0.85);
@text-color-secondary: rgba(0, 0, 0, 0.45);
@heading-color: rgba(0, 0, 0, 0.85);
@disabled-color: rgba(0, 0, 0, 0.25);

/* Background */
@component-background: #fff;
@body-background: #f0f2f5;
@layout-body-background: #f0f2f5;

/* Border */
@border-color-base: #d9d9d9;
@border-radius-base: 2px;

/* Spacing */
@padding-lg: 24px;
@padding-md: 16px;
@padding-sm: 12px;
@padding-xs: 8px;

/* Typography */
@font-size-base: 14px;
@font-size-lg: 16px;
@font-size-sm: 12px;

/* Layout */
@layout-header-background: #001529;
@layout-header-height: 64px;
@layout-sider-background: #001529;
```

### Using Theme Variables

```less
// user-card.component.less
.user-card {
  background: @component-background;
  padding: @padding-md;
  border: 1px solid @border-color-base;
  border-radius: @border-radius-base;

  &:hover {
    border-color: @primary-color;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.user-name {
  color: @heading-color;
  font-size: @font-size-lg;
  margin-bottom: @padding-xs;
}

.user-email {
  color: @text-color-secondary;
  font-size: @font-size-sm;
}

.status-active {
  color: @success-color;
}

.status-inactive {
  color: @disabled-color;
}
```

---

## Component Styling Patterns

### Basic Component Styles

```less
// user-list.component.less
.user-list-container {
  padding: @padding-lg;
  background: @component-background;
  min-height: 100vh;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: @padding-md;
  padding-bottom: @padding-sm;
  border-bottom: 1px solid @border-color-base;

  h2 {
    color: @heading-color;
    margin: 0;
  }
}

.user-actions {
  display: flex;
  gap: @padding-xs;
}
```

### Nested Selectors

```less
.user-table {
  background: @component-background;

  // Nested element
  .user-row {
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: @body-background;
    }

    // Deeply nested
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }

  // State modifiers
  &.loading {
    opacity: 0.6;
    pointer-events: none;
  }

  &.empty {
    .empty-state {
      padding: @padding-lg;
      text-align: center;
      color: @text-color-secondary;
    }
  }
}
```

### Responsive Styles

```less
.user-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: @padding-md;

  // Tablet
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Mobile
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.user-card {
  padding: @padding-md;

  @media (max-width: 576px) {
    padding: @padding-sm;
  }
}
```

---

## NG-ZORRO Grid Component

### Basic Grid Layout

```typescript
// user-dashboard.component.html
<div nz-row [nzGutter]="16">
  <div nz-col [nzSpan]="12">
    <nz-card nzTitle="Statistics">
      <!-- Card content -->
    </nz-card>
  </div>
  <div nz-col [nzSpan]="12">
    <nz-card nzTitle="Activity">
      <!-- Card content -->
    </nz-card>
  </div>
</div>
```

### Responsive Grid

```typescript
// Responsive breakpoints: xs (< 576px), sm (≥ 576px), md (≥ 768px), lg (≥ 992px), xl (≥ 1200px), xxl (≥ 1600px)
<div nz-row [nzGutter]="[16, 16]">
  <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6">
    <nz-card nzTitle="Card 1">Content</nz-card>
  </div>
  <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6">
    <nz-card nzTitle="Card 2">Content</nz-card>
  </div>
  <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6">
    <nz-card nzTitle="Card 3">Content</nz-card>
  </div>
  <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6">
    <nz-card nzTitle="Card 4">Content</nz-card>
  </div>
</div>
```

**Grid System:**

- 24-column grid system
- `nzSpan`: Number of columns (1-24)
- `nzXs`, `nzSm`, `nzMd`, `nzLg`, `nzXl`, `nzXxl`: Responsive breakpoints
- `nzGutter`: Gap between columns (number or `[horizontal, vertical]`)

### Nested Grids

```typescript
<div nz-row [nzGutter]="16">
  <div nz-col [nzSpan]="16">
    <!-- Nested grid -->
    <div nz-row [nzGutter]="8">
      <div nz-col [nzSpan]="12">
        <nz-card>Nested 1</nz-card>
      </div>
      <div nz-col [nzSpan]="12">
        <nz-card>Nested 2</nz-card>
      </div>
    </div>
  </div>
  <div nz-col [nzSpan]="8">
    <nz-card>Sidebar</nz-card>
  </div>
</div>
```

### Flexbox Grid

```typescript
<div nz-row [nzJustify]="'space-between'" [nzAlign]="'middle'">
  <div nz-col [nzSpan]="6">Left</div>
  <div nz-col [nzSpan]="6">Center</div>
  <div nz-col [nzSpan]="6">Right</div>
</div>

<!-- Alignment options -->
[nzAlign]="'top' | 'middle' | 'bottom'"
[nzJustify]="'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'"
```

---

## Theme Customization

### Global Theme Configuration

```less
// apps/web-ui/src/theme.less
@import '~ng-zorro-antd/ng-zorro-antd.less';

// Override default variables
@primary-color: #1890ff; // Brand color
@link-color: #1890ff;
@success-color: #52c41a;
@warning-color: #faad14;
@error-color: #f5222d;

@border-radius-base: 4px;
@font-size-base: 14px;

// Custom variables
@header-height: 64px;
@sidebar-width: 200px;
@content-padding: 24px;
```

### Using Custom Theme Variables

```less
// user-layout.component.less
.app-header {
  height: @header-height;
  background: @layout-header-background;
  padding: 0 @content-padding;
}

.app-sidebar {
  width: @sidebar-width;
  background: @layout-sider-background;
}

.app-content {
  padding: @content-padding;
  background: @layout-body-background;
}
```

---

## What NOT to Use

### ❌ Inline Styles in Template

```typescript
// ❌ AVOID - Inline styles in template
<div [style.padding]="'16px'" [style.background]="'#fff'">
  Content
</div>

// ❌ AVOID - ngStyle for static styles
<div [ngStyle]="{ padding: '16px', background: '#fff' }">
  Content
</div>
```

**Why avoid**: Not maintainable, can't use theme variables, hard to override

### ❌ Component-level CSS (not LESS)

```css
/* ❌ AVOID - Plain CSS instead of LESS */
/* user-list.component.css */
.container {
  padding: 16px; /* No theme variables! */
  background: #fff; /* Hardcoded color! */
}
```

**Why avoid**: Can't use LESS features (variables, nesting, mixins)

### ✅ Use LESS with Theme Variables

```less
// ✅ PREFERRED - LESS with theme variables
// user-list.component.less
.container {
  padding: @padding-md;
  background: @component-background;

  .header {
    margin-bottom: @padding-sm;
    color: @heading-color;
  }
}
```

---

## Code Style Standards

### Indentation

**2 spaces** (project standard, enforced by Prettier)

```less
.user-card {
  padding: @padding-md;
  display: flex;
  flex-direction: column;

  .user-header {
    margin-bottom: @padding-sm;
  }
}
```

### Quotes

**Single quotes** for strings (project standard)

```less
// ✅ CORRECT
@import '~ng-zorro-antd/ng-zorro-antd.less';
background: url('/assets/images/bg.png');
font-family: 'Roboto', sans-serif;

// ❌ WRONG
@import '~ng-zorro-antd/ng-zorro-antd.less';
background: url('/assets/images/bg.png');
```

### Trailing Commas

**Not applicable in LESS** (CSS/LESS doesn't use commas in the same way)

### Selector Naming

**kebab-case** for class names (Angular convention)

```less
// ✅ CORRECT
.user-list-container {
  // ...
}

.user-card-header {
  // ...
}

// ❌ WRONG - PascalCase or camelCase
.UserListContainer {
  // ...
}

.userCardHeader {
  // ...
}
```

---

## Common Style Patterns

### Flexbox Layout

```less
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: @padding-md;
}

.flex-column {
  display: flex;
  flex-direction: column;
  gap: @padding-sm;
}

.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### Spacing

```less
// Use theme variables for consistent spacing
padding: @padding-lg; // 24px
padding: @padding-md; // 16px
padding: @padding-sm; // 12px
padding: @padding-xs; // 8px

// Custom spacing with calculations
padding: @padding-md * 2; // 32px
margin-bottom: @padding-sm / 2; // 6px

// Directional spacing
padding-top: @padding-lg;
padding-right: @padding-md;
padding-bottom: @padding-sm;
padding-left: @padding-xs;

// Shorthand
padding: @padding-lg @padding-md; // top/bottom: 24px, left/right: 16px
```

### Positioning

```less
.relative-container {
  position: relative;
}

.absolute-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: @component-background;
}

.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: @padding-md;
  background: @component-background;
  border-top: 1px solid @border-color-base;
}
```

### Shadows and Effects

```less
.card-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

.elevation-1 {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.elevation-2 {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.elevation-3 {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
```

### Transitions

```less
.smooth-transition {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.fade-in {
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
```

---

## NG-ZORRO Component Styling

### Customizing NG-ZORRO Components

```less
// user-table.component.less

// Override NG-ZORRO table styles
::ng-deep {
  .ant-table {
    background: @component-background;

    .ant-table-thead > tr > th {
      background: @body-background;
      color: @heading-color;
      font-weight: 600;
    }

    .ant-table-tbody > tr {
      &:hover {
        background: @body-background;
      }

      &.selected {
        background: fade(@primary-color, 10%);
      }
    }
  }
}
```

**Note**: Use `::ng-deep` sparingly, only when you need to style child components. Prefer component-scoped styles.

### Inline Styles on NG-ZORRO Components

**Important**: Not all NG-ZORRO components support `[nzStyle]` or `[ngStyle]` bindings. Always check the component API documentation.

#### ✅ Correct Approaches:

**Option 1: Native `style` attribute (preferred for simple cases)**

```html
<!-- Static inline style -->
<nz-avatar style="background-color: #1890ff"></nz-avatar>

<!-- Dynamic with string interpolation -->
<nz-avatar [style]="'background-color: ' + dynamicColor"></nz-avatar>
```

**Option 2: Individual style bindings**

```html
<nz-avatar [style.background-color]="teamColor"></nz-avatar> <nz-tag [style.margin-left.px]="8"></nz-tag>
```

**Option 3: Component-specific properties (when available)**

```html
<!-- Some components have specific color/size properties -->
<nz-tag [nzColor]="'blue'"></nz-tag>
<nz-button [nzSize]="'large'"></nz-button>
```

#### ❌ Common Mistakes:

```html
<!-- DON'T: [nzStyle] doesn't work on nz-avatar -->
<nz-avatar [nzStyle]="{ backgroundColor: '#1890ff' }"></nz-avatar>

<!-- DON'T: [ngStyle] may not work on all NG-ZORRO components -->
<nz-avatar [ngStyle]="{ 'background-color': color }"></nz-avatar>
```

#### 💡 Best Practices:

1. **Prefer component-specific properties** when available (e.g., `nzColor`, `nzSize`)
2. **Use native `style` for simple static styles**
3. **Use `[style.property]` bindings for dynamic single properties**
4. **Only use `::ng-deep` in component LESS files** when you need to override child component styles
5. **Check NG-ZORRO docs** before assuming a component supports `[nzStyle]` or `[ngStyle]`

#### Common NG-ZORRO Components and Styling:

| Component   | Preferred Styling Approach    | Notes                               |
| ----------- | ----------------------------- | ----------------------------------- |
| `nz-avatar` | `style` or `[style.property]` | No `[nzStyle]` support              |
| `nz-tag`    | `[nzColor]` property          | Use predefined colors when possible |
| `nz-button` | Component properties          | `nzType`, `nzSize`, `nzDanger`      |
| `nz-card`   | LESS with `::ng-deep`         | Override `.ant-card` classes        |
| `nz-table`  | LESS with `::ng-deep`         | Override `.ant-table` classes       |

### Button Styles

```less
.action-button {
  margin-right: @padding-xs;

  &.primary {
    // NG-ZORRO nz-button[nzType="primary"] already styled
    // Add custom overrides if needed
  }

  &.danger {
    // NG-ZORRO nz-button[nzDanger] already styled
  }
}
```

### Form Styles

```less
.user-form {
  max-width: 600px;

  .form-item {
    margin-bottom: @padding-md;
  }

  .form-label {
    color: @heading-color;
    font-weight: 500;
    margin-bottom: @padding-xs;
  }

  .form-actions {
    display: flex;
    gap: @padding-sm;
    margin-top: @padding-lg;
  }
}
```

---

## Real-World Example

### Component with Organized Styles

```typescript
// user-dashboard.component.ts
@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzCardModule, NzTableModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.less'],
})
export class UserDashboardComponent {
  // ...
}
```

```html
<!-- user-dashboard.component.html -->
<div class="dashboard-container">
  <div class="dashboard-header">
    <h2>User Dashboard</h2>
    <button nz-button nzType="primary">Add User</button>
  </div>

  <div nz-row [nzGutter]="[16, 16]">
    <div nz-col [nzXs]="24" [nzMd]="12" [nzLg]="8">
      <nz-card class="stats-card" nzTitle="Total Users">
        <p class="stat-number">1,234</p>
      </nz-card>
    </div>
    <div nz-col [nzXs]="24" [nzMd]="12" [nzLg]="8">
      <nz-card class="stats-card" nzTitle="Active Users">
        <p class="stat-number">890</p>
      </nz-card>
    </div>
    <div nz-col [nzXs]="24" [nzMd]="12" [nzLg]="8">
      <nz-card class="stats-card" nzTitle="New This Week">
        <p class="stat-number">56</p>
      </nz-card>
    </div>
  </div>

  <nz-card class="user-table-card">
    <nz-table [nzData]="users">
      <!-- Table content -->
    </nz-table>
  </nz-card>
</div>
```

```less
// user-dashboard.component.less

/* ==========================================
   Layout
   ========================================== */
.dashboard-container {
  padding: @padding-lg;
  background: @body-background;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: @padding-lg;

  h2 {
    color: @heading-color;
    margin: 0;
  }
}

/* ==========================================
   Stats Cards
   ========================================== */
.stats-card {
  text-align: center;

  .stat-number {
    font-size: 32px;
    font-weight: 600;
    color: @primary-color;
    margin: @padding-md 0;
  }
}

/* ==========================================
   User Table
   ========================================== */
.user-table-card {
  margin-top: @padding-lg;

  ::ng-deep {
    .ant-table-tbody > tr {
      cursor: pointer;

      &:hover {
        background: @body-background;
      }
    }
  }
}
```

---

## Summary

**Styling Checklist:**

- ✅ Use LESS for component styles (`.component.less`)
- ✅ Use theme variables (`@primary-color`, `@padding-md`, etc.)
- ✅ <100 lines: single .less file; >100 lines: organize with comments
- ✅ NG-ZORRO Grid: `[nzXs]="24" [nzMd]="12"`
- ✅ 2 space indentation (project standard)
- ✅ Single quotes for strings
- ✅ kebab-case for class names
- ✅ Use `::ng-deep` sparingly (only for child component styles)
- ❌ No inline styles in templates
- ❌ No plain CSS (use LESS)

**See Also:**

- [component-patterns-guide.md](component-patterns-guide.md) - Component structure
- [file-organization-guide.md](file-organization-guide.md) - File naming conventions
