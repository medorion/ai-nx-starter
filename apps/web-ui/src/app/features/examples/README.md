# Zorro Components Module

This module centralizes all ng-zorro-antd components and services for easy management and consistent usage throughout the application.

## Features

### 📦 All ng-zorro-antd Modules

- **Basic Components**: Button, Icon, Typography, Grid, Layout, etc.
- **Form Components**: Input, Select, Checkbox, Radio, DatePicker, etc.
- **Data Display**: Table, Card, List, Avatar, Badge, etc.
- **Feedback**: Alert, Modal, Message, Notification, Progress, etc.
- **Navigation**: Menu, Breadcrumb, Tabs, Steps, etc.

### 🛠️ Services Included

- `NzMessageService` - For displaying messages
- `NzNotificationService` - For displaying notifications

## Usage

### Import in Module

```typescript
import { ZorroComponentsModule } from './features/zorro-componets/zorro-components.module';

@NgModule({
  imports: [ZorroComponentsModule],
})
export class YourModule {}
```

### Alternative Import

```typescript
import { ZorroComponentsModule } from './features/zorro-componets';
```

## Benefits

1. **Centralized Management**: All ng-zorro modules in one place
2. **Easy Maintenance**: Add/remove modules from a single location
3. **Consistent Imports**: Same import pattern across the application
4. **Bundle Optimization**: Tree-shaking removes unused components
5. **Type Safety**: Full TypeScript support for all components

## Components Available

All ng-zorro-antd components are available after importing this module:

- `nz-button`, `nz-card`, `nz-table`, `nz-form`, etc.
- All component properties and methods are fully typed
- Services can be injected in components and services

## Example Usage

```typescript
// In component
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  template: `
    <nz-card nzTitle="Example">
      <nz-button nzType="primary" (click)="showMessage()"> Click me </nz-button>
    </nz-card>
  `,
})
export class ExampleComponent {
  constructor(private message: NzMessageService) {}

  showMessage(): void {
    this.message.success('Hello from ng-zorro!');
  }
}
```
