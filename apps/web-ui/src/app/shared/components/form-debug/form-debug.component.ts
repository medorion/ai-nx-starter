import { Component, Input, Optional, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-form-debug',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzBadgeModule,
    NzTagModule,
    NzIconModule,
    NzCollapseModule,
    NzTypographyModule,
    NzSpaceModule,
    NzDividerModule,
    NzGridModule,
    NzToolTipModule,
  ],
  templateUrl: './form-debug.component.html',
  styleUrl: './form-debug.component.less',
})
export class FormDebugComponent {
  @Input() formGroup?: FormGroup;
  @Input() title: string = 'Form Debug';
  @Input() showValues: boolean = true;
  @Input() showErrors: boolean = true;
  @Input() showStatus: boolean = true;
  @Input() collapsed: boolean = false;

  constructor(@Optional() @Inject(NZ_MODAL_DATA) public modalData?: any) {
    // If opened in modal, use modal data to override inputs
    if (modalData) {
      this.formGroup = modalData.formGroup || this.formGroup;
      this.title = modalData.title || this.title;
      this.showValues = modalData.showValues !== undefined ? modalData.showValues : this.showValues;
      this.showErrors = modalData.showErrors !== undefined ? modalData.showErrors : this.showErrors;
      this.showStatus = modalData.showStatus !== undefined ? modalData.showStatus : this.showStatus;
      this.collapsed = modalData.collapsed !== undefined ? modalData.collapsed : this.collapsed;
    }
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  getFormErrors(): any {
    if (!this.formGroup) return {};

    const errors: any = {};
    Object.keys(this.formGroup.controls).forEach((key) => {
      const control = this.formGroup!.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  getFormValues(): any {
    return this.formGroup?.value || {};
  }

  getFormStatus(): any {
    if (!this.formGroup) return {};

    return {
      valid: this.formGroup.valid,
      invalid: this.formGroup.invalid,
      pending: this.formGroup.pending,
      disabled: this.formGroup.disabled,
      touched: this.formGroup.touched,
      untouched: this.formGroup.untouched,
      dirty: this.formGroup.dirty,
      pristine: this.formGroup.pristine,
    };
  }

  getControlStatus(controlName: string): any {
    const control = this.formGroup?.get(controlName);
    if (!control) return {};

    return {
      valid: control.valid,
      invalid: control.invalid,
      pending: control.pending,
      disabled: control.disabled,
      touched: control.touched,
      untouched: control.untouched,
      dirty: control.dirty,
      pristine: control.pristine,
      value: control.value,
      errors: control.errors,
    };
  }

  getControlNames(): string[] {
    return this.formGroup ? Object.keys(this.formGroup.controls) : [];
  }

  getControlValidators(controlName: string): string[] {
    const control = this.formGroup?.get(controlName);
    if (!control) return [];

    const validators: string[] = [];

    // Get the validator function from the control
    const validator = (control as any).validator;
    if (!validator) return validators;

    // Test the validator with different scenarios to identify validator types
    const testCases = [
      { value: '', expected: 'required' },
      { value: null, expected: 'required' },
      { value: undefined, expected: 'required' },
      { value: 'invalid-email', expected: 'email' },
      { value: 'test@', expected: 'email' },
      { value: 'test@invalid', expected: 'email' },
      { value: 'a', expected: 'minlength' },
      { value: 'ab', expected: 'minlength' },
      { value: 'a'.repeat(1000), expected: 'maxlength' },
      { value: -1, expected: 'min' },
      { value: 1000000, expected: 'max' },
      { value: 'invalid-pattern', expected: 'pattern' },
      { value: 'not-a-url', expected: 'isUrl' },
      { value: 'invalid-url', expected: 'isUrl' },
      { value: 'not-boolean', expected: 'isBoolean' },
      { value: 123, expected: 'isString' },
      { value: 'string', expected: 'isNumber' },
    ];

    // Test each case to identify validators
    testCases.forEach((testCase) => {
      try {
        const testControl = { value: testCase.value };
        const result = validator(testControl);
        if (result && result[testCase.expected]) {
          if (!validators.includes(testCase.expected)) {
            validators.push(testCase.expected);
          }
        }
      } catch (error) {
        // Ignore errors during testing
      }
    });

    // Test for custom validators from FormGroupService
    const customValidatorTests = [
      { value: '', expected: 'isNotEmpty' },
      { value: null, expected: 'isNotEmpty' },
      { value: undefined, expected: 'isNotEmpty' },
      { value: 'not-boolean', expected: 'isBoolean' },
      { value: 123, expected: 'isString' },
      { value: 'string', expected: 'isNumber' },
      { value: 'invalid-url', expected: 'isUrl' },
    ];

    customValidatorTests.forEach((testCase) => {
      try {
        const testControl = { value: testCase.value };
        const result = validator(testControl);
        if (result && result[testCase.expected]) {
          if (!validators.includes(testCase.expected)) {
            validators.push(testCase.expected);
          }
        }
      } catch (error) {
        // Ignore errors during testing
      }
    });

    // Check for any errors with current value to catch additional validators
    try {
      const currentResult = validator({ value: control.value });
      if (currentResult) {
        Object.keys(currentResult).forEach((key) => {
          if (!validators.includes(key)) {
            validators.push(key);
          }
        });
      }
    } catch (error) {
      // Ignore errors
    }

    // If no validators found but control has validator, try to detect by running with empty value
    if (validators.length === 0 && validator) {
      try {
        const emptyResult = validator({ value: '' });
        if (emptyResult && Object.keys(emptyResult).length > 0) {
          Object.keys(emptyResult).forEach((key) => {
            validators.push(key);
          });
        } else {
          validators.push('custom-validator');
        }
      } catch (error) {
        validators.push('custom-validator');
      }
    }

    return validators;
  }

  getValidatorDetails(controlName: string): any {
    const control = this.formGroup?.get(controlName);
    if (!control) return {};

    const validator = (control as any).validator;
    if (!validator) return {};

    const details: any = {};

    // Test for specific validator constraints
    const testCases = [
      { value: '', key: 'required' },
      { value: null, key: 'required' },
      { value: 'test@invalid', key: 'email' },
      { value: 'invalid-email', key: 'email' },
      { value: 'a', key: 'minlength' },
      { value: 'ab', key: 'minlength' },
      { value: 'a'.repeat(1000), key: 'maxlength' },
      { value: -1, key: 'min' },
      { value: 1000000, key: 'max' },
      { value: '', key: 'isNotEmpty' },
      { value: null, key: 'isNotEmpty' },
      { value: 'invalid-url', key: 'isUrl' },
      { value: 'not-boolean', key: 'isBoolean' },
      { value: 123, key: 'isString' },
      { value: 'string', key: 'isNumber' },
    ];

    testCases.forEach((testCase) => {
      try {
        const result = validator({ value: testCase.value });
        if (result && result[testCase.key]) {
          details[testCase.key] = result[testCase.key];
        }
      } catch (error) {
        // Ignore errors during testing
      }
    });

    return details;
  }

  getStatusColor(key: string, value: any): string {
    if (key === 'valid' && value) return 'success';
    if (key === 'invalid' && value) return 'error';
    if (key === 'dirty' && value) return 'warning';
    if (key === 'touched' && value) return 'processing';
    if (value) return 'default';
    return 'default';
  }

  // Debug method to help understand what validators are actually present
  debugControlValidators(controlName: string): void {
    const control = this.formGroup?.get(controlName);
    if (!control) {
      console.log(`No control found for: ${controlName}`);
      return;
    }

    console.log(`=== Debug Control: ${controlName} ===`);
    console.log('Control:', control);
    console.log('Control validator:', (control as any).validator);
    console.log('Control errors:', control.errors);

    const validator = (control as any).validator;
    if (validator) {
      console.log('Testing validator with empty string:');
      const emptyResult = validator({ value: '' });
      console.log('Empty result:', emptyResult);

      console.log('Testing validator with invalid email:');
      const emailResult = validator({ value: 'invalid-email' });
      console.log('Email result:', emailResult);

      console.log('Testing validator with current value:');
      const currentResult = validator({ value: control.value });
      console.log('Current result:', currentResult);
    }
  }
}
