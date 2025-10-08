# FormDebugLinkComponent

A link button component that opens the FormDebugComponent in a modal when clicked.

## Usage

### Basic Usage

```typescript
import { FormDebugLinkComponent } from '../../shared/components/form-debug-link/form-debug-link.component';

@Component({
  // ...
  imports: [FormDebugLinkComponent], // For standalone components
})
```

```html
<app-form-debug-link [formGroup]="myFormGroup" linkText="Debug Form"></app-form-debug-link>
```

### Advanced Usage with All Options

```html
<app-form-debug-link
  [formGroup]="organizationForm"
  [title]="'Organization Form Debug'"
  [showValues]="true"
  [showErrors]="true"
  [showStatus]="true"
  [collapsed]="false"
  [linkText]="'Debug Organization Form'"
  [modalWidth]="'900px'"
></app-form-debug-link>
```

## Inputs

| Input        | Type        | Default        | Description                   |
| ------------ | ----------- | -------------- | ----------------------------- |
| `formGroup`  | `FormGroup` | `undefined`    | The FormGroup to debug        |
| `title`      | `string`    | `'Form Debug'` | Title shown in the modal      |
| `showValues` | `boolean`   | `true`         | Show form values section      |
| `showErrors` | `boolean`   | `true`         | Show form errors section      |
| `showStatus` | `boolean`   | `true`         | Show form status section      |
| `collapsed`  | `boolean`   | `false`        | Initial collapsed state       |
| `linkText`   | `string`    | `'Debug Form'` | Text shown on the link button |
| `modalWidth` | `string`    | `'800px'`      | Width of the modal            |

## Features

- Opens FormDebugComponent in a modal
- Passes all inputs to the FormDebugComponent
- Customizable link text and modal width
- Standalone component - easy to import
- Minimal styling - just a link button with bug icon

## Example in a Form Component

```typescript
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDebugLinkComponent } from '../../shared/components/form-debug-link/form-debug-link.component';

@Component({
  selector: 'app-my-form',
  standalone: true,
  imports: [FormDebugLinkComponent],
  template: `
    <form [formGroup]="myForm">
      <!-- Your form fields -->

      <div class="form-actions">
        <button type="submit">Submit</button>
        <app-form-debug-link [formGroup]="myForm"></app-form-debug-link>
      </div>
    </form>
  `,
})
export class MyFormComponent {
  myForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });
}
```
