export const DEFAULT_ERROR_MESSAGES: { [key: string]: string } = {
  // Basic validators
  required: 'This field is required',
  isDefined: 'This field must be defined',
  isNotEmpty: 'This field cannot be empty',
  equals: 'Value must be equal to the specified value',
  notEquals: 'Value must not be equal to the specified value',

  // Type validators
  isBoolean: 'Value must be a boolean (true or false)',
  isDate: 'Value must be a valid date',
  isString: 'Value must be a string',
  isNumber: 'Value must be a number',
  isInt: 'Value must be an integer',
  isArray: 'Value must be an array',
  isEnum: 'Value must be one of the allowed values',

  // Number validators
  min: 'Value must be greater than or equal to {min}',
  max: 'Value must be less than or equal to {max}',
  isPositive: 'Value must be a positive number',
  isNegative: 'Value must be a negative number',
  isDivisibleBy: 'Value must be divisible by {divisor}',

  // String validators
  email: 'Please enter a valid email address',
  minlength: 'Value must be at least {requiredLength} characters long',
  maxlength: 'Value must be no more than {requiredLength} characters long',
  minLength: 'Value must be at least {minLength} characters long',
  maxLength: 'Value must be no more than {maxLength} characters long',
  length: 'Value must be between the specified length range',
  pattern: 'Value does not match the required pattern',
  matches: 'Value does not match the required pattern',
  contains: 'Value must contain "{seed}"',
  notContains: 'Value must not contain "{seed}"',

  // String format validators
  isAlpha: 'Value must contain only letters',
  isAlphanumeric: 'Value must contain only letters and numbers',
  isAscii: 'Value must contain only ASCII characters',
  isBase64: 'Value must be a valid Base64 string',
  isCreditCard: 'Please enter a valid credit card number',
  isHexColor: 'Value must be a valid hex color (e.g., #FF0000)',
  isHexadecimal: 'Value must be a valid hexadecimal string',
  isIP: 'Please enter a valid IP address',
  isJSON: 'Value must be a valid JSON string',
  isJWT: 'Value must be a valid JWT token',
  isLowercase: 'Value must be in lowercase',
  isUppercase: 'Value must be in uppercase',
  isMobilePhone: 'Please enter a valid mobile phone number',
  isUrl: 'Please enter a valid URL',
  isUUID: 'Value must be a valid UUID',
  isPostalCode: 'Please enter a valid postal code',
  isStrongPassword: 'Password must meet strength requirements',

  // Date validators
  minDate: 'Date must be after the minimum date',
  maxDate: 'Date must be before the maximum date',
  isISO8601: 'Date must be in ISO 8601 format',

  // Array validators
  arrayNotEmpty: 'Array cannot be empty',
  arrayMinSize: 'Array must contain at least {minSize} items',
  arrayMaxSize: 'Array must contain no more than {maxSize} items',
  arrayUnique: 'Array items must be unique',

  // Generic fallback messages
  invalid: 'Value is invalid',
  custom: 'Value does not meet the required criteria',
};
