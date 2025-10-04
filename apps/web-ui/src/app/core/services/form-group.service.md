## Available Validators:

https://github.com/typestack/class-validator

@IsNotEmpty → Validators.required
@IsDefined → Validators.required
@Equals(value) → Custom equality validator
@NotEquals(value) → Custom inequality validator
Type Validators:

@IsEmail() → Validators.email
@IsString() → Custom string type validator
@IsNumber() → Custom number validator with options
@IsBoolean() → Custom boolean validator
@IsArray() → Custom array validator
String Validators:

@MinLength(n) → Validators.minLength(n)
@MaxLength(n) → Validators.maxLength(n)
@Length(min, max) → Custom length range validator
@Matches(pattern) → Validators.pattern(pattern)
@IsUrl() → Custom URL validator
@IsUUID() → Custom UUID validator
@IsAlpha() → Pattern for alphabetic characters
@IsAlphanumeric() → Pattern for alphanumeric characters
Advanced Validators:

@IsStrongPassword() → Custom strong password validator
@IsCreditCard() → Luhn algorithm implementation
@IsIP(version?) → IPv4/IPv6 validation
@IsJSON() → JSON format validation
@IsJWT() → JWT token format validation
Number Validators:

@Min(n) → Validators.min(n)
@Max(n) → Validators.max(n)
@IsPositive() → Validators.min(0.01)
@IsNegative() → Validators.max(-0.01)
Array Validators:

@ArrayNotEmpty() → Custom array not empty validator
@ArrayMinSize(n) → Custom array minimum size validator
@ArrayMaxSize(n) → Custom array maximum size validator
@ArrayUnique() → Custom array uniqueness validator

validateForm = this.fb.group({
email: this.fb.control('', [Validators.email, Validators.required]),
password: this.fb.control('', [Validators.required]),
// ... many more manual validators
});
