import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NzFormTooltipIcon } from 'ng-zorro-antd/form';
import { FormGroupService } from '../../../core/services/form-group.service';
import { ClientUserDto } from './dto/user.dto';
import { DEFAULT_ERROR_MESSAGES } from '../../../core/services/form-group-error-messages';

@Component({
  selector: 'app-forms',
  standalone: false,
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.less',
})
export class FormsComponent implements OnInit, OnDestroy {
  private formGroupService = inject(FormGroupService);
  private destroy$ = new Subject<void>();

  validateForm: FormGroup;
  DEFAULT_ERROR_MESSAGES = DEFAULT_ERROR_MESSAGES;

  captchaTooltipIcon: NzFormTooltipIcon = {
    type: 'info-circle',
    theme: 'twotone',
  };

  constructor() {
    // Create form group using the FormGroupService and ClientUserDto
    this.validateForm = this.formGroupService.createFormGroup(ClientUserDto);

    // Add custom confirmation validator for checkPassword
    this.validateForm.get('checkPassword')?.addValidators(this.confirmationValidator.bind(this));
  }

  ngOnInit(): void {
    this.validateForm.controls['password'].valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.validateForm.controls['checkPassword'].updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  confirmationValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  }

  getCaptcha(e: MouseEvent): void {
    e.preventDefault();
  }

  // Demo method to show form structure and validation
  logFormInfo(): void {
    console.log('=== FormGroupService Demo ===');
    console.log('Form Structure:', this.validateForm.controls);
    console.log('Form Value:', this.validateForm.value);
    console.log('Form Valid:', this.validateForm.valid);
    console.log('Form Errors:', this.getFormErrors());
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.validateForm.controls).forEach((key) => {
      const control = this.validateForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Helper methods for form validation display
  isFieldInvalid(fieldName: string): boolean {
    return !this.formGroupService.isControlValid(fieldName, this.validateForm);
  }

  getFieldError(fieldName: string): string {
    return this.formGroupService.getControlError(fieldName, this.validateForm);
  }
}
