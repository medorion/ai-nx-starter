import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { getMetadataStorage } from 'class-validator';
import { DEFAULT_ERROR_MESSAGES } from './form-group-error-messages';

@Injectable({
  providedIn: 'root',
})
export class FormGroupService {
  public readonly errorMessages: Readonly<{ [key: string]: string }> = DEFAULT_ERROR_MESSAGES;

  constructor(private fb: FormBuilder) {}

  /**
   * Checks if a form control is valid
   * @param controlName The name of the form control
   * @param formGroup The FormGroup containing the control
   * @returns true if the control is valid or hasn't been touched/dirty, false otherwise
   */
  isControlValid(controlName: string, formGroup: FormGroup): boolean {
    const control = formGroup.get(controlName);
    if (!control) return true;
    return !(control.invalid && (control.dirty || control.touched));
  }

  /**
   * Gets the error message for a form control
   * @param controlName The name of the form control
   * @param formGroup The FormGroup containing the control
   * @returns The error message string, or empty string if no error
   */
  getControlError(controlName: string, formGroup: FormGroup): string {
    const control = formGroup.get(controlName);
    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return '';
    }

    const errors = control.errors;

    // Check each error type and return appropriate message
    for (const errorType of Object.keys(errors)) {
      const errorValue = errors[errorType];
      let message = this.errorMessages[errorType] || this.errorMessages['invalid'];

      // Handle parameterized error messages
      if (typeof errorValue === 'object' && errorValue !== null) {
        message = this.interpolateErrorMessage(message, errorValue);
      }

      return message;
    }

    return '';
  }

  /**
   * Interpolates error message with parameter values
   * @param message The error message template
   * @param params The parameters to interpolate
   * @returns The interpolated message
   */
  private interpolateErrorMessage(message: string, params: any): string {
    let interpolated = message;

    // Common parameter interpolations
    if (params.requiredLength !== undefined) {
      interpolated = interpolated.replace('{requiredLength}', params.requiredLength.toString());
    }
    if (params.actualLength !== undefined) {
      interpolated = interpolated.replace('{actualLength}', params.actualLength.toString());
    }
    if (params.min !== undefined) {
      interpolated = interpolated.replace('{min}', params.min.toString());
    }
    if (params.max !== undefined) {
      interpolated = interpolated.replace('{max}', params.max.toString());
    }
    if (params.minLength !== undefined) {
      interpolated = interpolated.replace('{minLength}', params.minLength.toString());
    }
    if (params.maxLength !== undefined) {
      interpolated = interpolated.replace('{maxLength}', params.maxLength.toString());
    }
    if (params.minSize !== undefined) {
      interpolated = interpolated.replace('{minSize}', params.minSize.toString());
    }
    if (params.maxSize !== undefined) {
      interpolated = interpolated.replace('{maxSize}', params.maxSize.toString());
    }
    if (params.divisor !== undefined) {
      interpolated = interpolated.replace('{divisor}', params.divisor.toString());
    }
    if (params.seed !== undefined) {
      interpolated = interpolated.replace('{seed}', params.seed.toString());
    }
    if (params.expectedValue !== undefined) {
      interpolated = interpolated.replace('{expectedValue}', params.expectedValue.toString());
    }
    if (params.actualValue !== undefined) {
      interpolated = interpolated.replace('{actualValue}', params.actualValue.toString());
    }

    return interpolated;
  }

  /**
   * Creates a FormGroup from a class with class-validator decorators
   * @param classConstructor The class constructor
   * @param initialValues Optional initial values for the form
   * @returns FormGroup with validators based on class-validator decorators
   */
  createFormGroup<T>(classConstructor: new () => T, initialValues?: Partial<T>): FormGroup {
    const instance = new classConstructor();
    const metadataStorage = getMetadataStorage();

    // Correct method signature: targetConstructor, targetSchema, always, strictGroups, groups?
    const validationMetadatas = metadataStorage.getTargetValidationMetadatas(
      classConstructor,
      '', // targetSchema
      true, // always - include metadata that should always be validated
      false, // strictGroups - don't use strict group validation
      undefined, // groups - no specific groups
    );

    const formControls: { [key: string]: any } = {};

    // Get all properties from the class instance
    const properties = Object.getOwnPropertyNames(instance);

    properties.forEach((property) => {
      // Get initial value
      const initialValue = initialValues?.[property as keyof T] ?? (instance as any)[property];

      // Get validation metadata for this property
      const propertyValidations = validationMetadatas.filter((meta) => meta.propertyName === property);

      // Convert class-validator decorators to Angular validators
      const validators = this.createValidators(propertyValidations);

      formControls[property] = this.fb.control(initialValue, validators);
    });

    return this.fb.group(formControls);
  }

  /**
   * Converts class-validator metadata to Angular validators
   */
  private createValidators(validationMetadatas: any[]): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    validationMetadatas.forEach((meta) => {
      const validator = this.mapValidatorDecorator(meta);
      if (validator) {
        validators.push(validator);
      }
    });

    return validators;
  }

  /**
   * Maps class-validator decorators to Angular validators
   */
  private mapValidatorDecorator(meta: any): ValidatorFn | null {
    const { type, constraints, name } = meta;

    if (type === 'customValidation') {
      switch (name) {
        // Basic validators
        case 'isDefined':
        case 'IsDefined':
          return Validators.required;

        case 'isNotEmpty':
        case 'IsNotEmpty':
        case 'NOT_EMPTY':
          return Validators.required;

        case 'equals':
          return this.createEqualsValidator(constraints[0]);

        case 'notEquals':
          return this.createNotEqualsValidator(constraints[0]);

        // Type validators
        case 'isBoolean':
          return this.createBooleanValidator();

        case 'isDate':
          return this.createDateValidator();

        case 'isString':
          return this.createStringValidator();

        case 'isNumber':
          return this.createNumberValidator(constraints[0]);

        case 'isInt':
          return this.createIntegerValidator();

        case 'isArray':
          return this.createArrayValidator();

        case 'isEnum':
          return this.createEnumValidator(constraints[0]);

        // Number validators
        case 'min':
          return Validators.min(constraints[0]);

        case 'max':
          return Validators.max(constraints[0]);

        case 'isPositive':
          return Validators.min(0.01);

        case 'isNegative':
          return Validators.max(-0.01);

        case 'isDivisibleBy':
          return this.createDivisibleByValidator(constraints[0]);

        // String validators
        case 'isEmail':
        case 'IsEmail':
        case 'EMAIL':
          return Validators.email;

        case 'minLength':
        case 'MinLength':
        case 'MIN_LENGTH':
          return Validators.minLength(constraints[0]);

        case 'maxLength':
          return Validators.maxLength(constraints[0]);

        case 'length':
          return this.createLengthValidator(constraints[0], constraints[1]);

        case 'matches':
          return Validators.pattern(constraints[0]);

        case 'contains':
          return this.createContainsValidator(constraints[0]);

        case 'notContains':
          return this.createNotContainsValidator(constraints[0]);

        case 'isAlpha':
          return Validators.pattern(/^[a-zA-Z]+$/);

        case 'isAlphanumeric':
          return Validators.pattern(/^[a-zA-Z0-9]+$/);

        case 'isAscii':
          // eslint-disable-next-line no-control-regex
          return Validators.pattern(/^[\x00-\x7F]+$/);

        case 'isBase64':
          return this.createBase64Validator();

        case 'isCreditCard':
          return this.createCreditCardValidator();

        case 'isHexColor':
          return Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

        case 'isHexadecimal':
          return Validators.pattern(/^[a-fA-F0-9]+$/);

        case 'isIP':
          return this.createIPValidator(constraints[0]);

        case 'isJSON':
          return this.createJSONValidator();

        case 'isJWT':
          return this.createJWTValidator();

        case 'isLowercase':
          return this.createLowercaseValidator();

        case 'isUppercase':
          return this.createUppercaseValidator();

        case 'isMobilePhone':
          return this.createMobilePhoneValidator(constraints[0]);

        case 'isUrl':
          return this.createUrlValidator();

        case 'isUUID':
          return this.createUUIDValidator(constraints[0]);

        case 'isPostalCode':
          return this.createPostalCodeValidator(constraints[0]);

        case 'isStrongPassword':
          return this.createStrongPasswordValidator(constraints[0]);

        // Date validators
        case 'minDate':
          return this.createMinDateValidator(constraints[0]);

        case 'maxDate':
          return this.createMaxDateValidator(constraints[0]);

        case 'isISO8601':
          return this.createISO8601Validator();

        // Array validators
        case 'arrayNotEmpty':
          return this.createArrayNotEmptyValidator();

        case 'arrayMinSize':
          return this.createArrayMinSizeValidator(constraints[0]);

        case 'arrayMaxSize':
          return this.createArrayMaxSizeValidator(constraints[0]);

        case 'arrayUnique':
          return this.createArrayUniqueValidator();

        default:
          console.warn(`Validator name '${name}' is not supported yet`);
          return null;
      }
    } else {
      console.warn(`Validator type '${type}' is not supported yet`);
      return null;
    }
  }

  // Custom validator implementations
  private createEqualsValidator(value: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === value ? null : { equals: { actualValue: control.value, expectedValue: value } };
    };
  }

  private createNotEqualsValidator(value: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value !== value ? null : { notEquals: { actualValue: control.value, forbiddenValue: value } };
    };
  }

  private createBooleanValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return typeof control.value === 'boolean' ? null : { isBoolean: true };
    };
  }

  private createDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = new Date(control.value);
      return !isNaN(date.getTime()) ? null : { isDate: true };
    };
  }

  private createStringValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return typeof control.value === 'string' ? null : { isString: true };
    };
  }

  private createNumberValidator(options?: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const num = Number(control.value);
      if (isNaN(num)) {
        return { isNumber: true };
      }

      if (options?.allowNaN === false && isNaN(num)) {
        return { isNumber: { message: 'NaN is not allowed' } };
      }

      if (options?.allowInfinity === false && !isFinite(num)) {
        return { isNumber: { message: 'Infinity is not allowed' } };
      }

      return null;
    };
  }

  private createIntegerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const num = Number(control.value);
      return Number.isInteger(num) ? null : { isInt: true };
    };
  }

  private createArrayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Array.isArray(control.value) ? null : { isArray: true };
    };
  }

  private createEnumValidator(enumObject: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const values = Object.values(enumObject);
      return values.includes(control.value) ? null : { isEnum: { validValues: values } };
    };
  }

  private createDivisibleByValidator(divisor: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const num = Number(control.value);
      return num % divisor === 0 ? null : { isDivisibleBy: { divisor } };
    };
  }

  private createLengthValidator(min: number, max?: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const length = control.value?.length || 0;
      if (length < min) {
        return { length: { actualLength: length, minLength: min } };
      }
      if (max && length > max) {
        return { length: { actualLength: length, maxLength: max } };
      }
      return null;
    };
  }

  private createContainsValidator(seed: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value?.includes(seed) ? null : { contains: { seed } };
    };
  }

  private createNotContainsValidator(seed: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return !control.value?.includes(seed) ? null : { notContains: { seed } };
    };
  }

  private createBase64Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Regex.test(control.value) ? null : { isBase64: true };
    };
  }

  private createCreditCardValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Luhn algorithm implementation
      const value = control.value?.replace(/\s/g, '');
      if (!value) return { isCreditCard: true };

      let sum = 0;
      let isEven = false;

      for (let i = value.length - 1; i >= 0; i--) {
        let digit = parseInt(value[i]);

        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        isEven = !isEven;
      }

      return sum % 10 === 0 ? null : { isCreditCard: true };
    };
  }

  private createIPValidator(version?: '4' | '6'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

      if (!version) {
        return ipv4Regex.test(control.value) || ipv6Regex.test(control.value) ? null : { isIP: true };
      }

      if (version === '4') {
        return ipv4Regex.test(control.value) ? null : { isIP: { version: '4' } };
      }

      if (version === '6') {
        return ipv6Regex.test(control.value) ? null : { isIP: { version: '6' } };
      }

      return { isIP: true };
    };
  }

  private createJSONValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      try {
        JSON.parse(control.value);
        return null;
      } catch {
        return { isJSON: true };
      }
    };
  }

  private createJWTValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
      return jwtRegex.test(control.value) ? null : { isJWT: true };
    };
  }

  private createLowercaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === control.value?.toLowerCase() ? null : { isLowercase: true };
    };
  }

  private createUppercaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === control.value?.toUpperCase() ? null : { isUppercase: true };
    };
  }

  private createMobilePhoneValidator(locale: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Basic mobile phone validation - in real app, use a proper library
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return phoneRegex.test(control.value) ? null : { isMobilePhone: { locale } };
    };
  }

  private createUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      try {
        new URL(control.value);
        return null;
      } catch {
        return { isUrl: true };
      }
    };
  }

  private createUUIDValidator(version?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(control.value) ? null : { isUUID: { version } };
    };
  }

  private createPostalCodeValidator(locale: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Basic postal code validation - in real app, use locale-specific patterns
      const postalRegex = /^[A-Z0-9\s-]{3,10}$/i;
      return postalRegex.test(control.value) ? null : { isPostalCode: { locale } };
    };
  }

  private createStrongPasswordValidator(options?: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { isStrongPassword: true };

      const minLength = options?.minLength || 8;
      const minLowercase = options?.minLowercase || 1;
      const minUppercase = options?.minUppercase || 1;
      const minNumbers = options?.minNumbers || 1;
      const minSymbols = options?.minSymbols || 1;

      const errors: any = {};

      if (value.length < minLength) {
        errors.minLength = minLength;
      }

      const lowercaseCount = (value.match(/[a-z]/g) || []).length;
      if (lowercaseCount < minLowercase) {
        errors.minLowercase = minLowercase;
      }

      const uppercaseCount = (value.match(/[A-Z]/g) || []).length;
      if (uppercaseCount < minUppercase) {
        errors.minUppercase = minUppercase;
      }

      const numbersCount = (value.match(/[0-9]/g) || []).length;
      if (numbersCount < minNumbers) {
        errors.minNumbers = minNumbers;
      }

      const symbolsCount = (value.match(/[^A-Za-z0-9]/g) || []).length;
      if (symbolsCount < minSymbols) {
        errors.minSymbols = minSymbols;
      }

      return Object.keys(errors).length > 0 ? { isStrongPassword: errors } : null;
    };
  }

  private createMinDateValidator(minDate: Date | (() => Date)): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = new Date(control.value);
      const min = typeof minDate === 'function' ? minDate() : minDate;
      return date >= min ? null : { minDate: { minDate: min, actualDate: date } };
    };
  }

  private createMaxDateValidator(maxDate: Date | (() => Date)): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = new Date(control.value);
      const max = typeof maxDate === 'function' ? maxDate() : maxDate;
      return date <= max ? null : { maxDate: { maxDate: max, actualDate: date } };
    };
  }

  private createISO8601Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return iso8601Regex.test(control.value) ? null : { isISO8601: true };
    };
  }

  private createArrayNotEmptyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Array.isArray(control.value) && control.value.length > 0 ? null : { arrayNotEmpty: true };
    };
  }

  private createArrayMinSizeValidator(minSize: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const size = Array.isArray(control.value) ? control.value.length : 0;
      return size >= minSize ? null : { arrayMinSize: { minSize, actualSize: size } };
    };
  }

  private createArrayMaxSizeValidator(maxSize: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const size = Array.isArray(control.value) ? control.value.length : 0;
      return size <= maxSize ? null : { arrayMaxSize: { maxSize, actualSize: size } };
    };
  }

  private createArrayUniqueValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!Array.isArray(control.value)) return null;

      const unique = [...new Set(control.value)];
      return unique.length === control.value.length ? null : { arrayUnique: true };
    };
  }
}
