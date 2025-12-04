# Frontend Security - Angular Best Practices

Security guide for Angular frontend applications covering XSS prevention, sanitization, and secure patterns.

## Table of Contents

- [Overview](#overview)
- [XSS Prevention](#xss-prevention)
- [Angular Sanitization](#angular-sanitization)
- [CSRF Protection](#csrf-protection)
- [Secure Form Handling](#secure-form-handling)
- [Sensitive Data Handling](#sensitive-data-handling)
- [URL and Navigation Security](#url-and-navigation-security)
- [Security Checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)

---

## Overview

Angular provides built-in security mechanisms that protect against common web vulnerabilities.

**Key Protections:**

- ✅ Automatic HTML sanitization in templates
- ✅ Built-in XSS protection via interpolation
- ✅ DomSanitizer for controlled bypass
- ✅ Secure routing with guards
- ✅ HttpClient with interceptors for auth tokens

**Key Principle:** Trust Angular's defaults. Only bypass security when absolutely necessary.

---

## XSS Prevention

### RULE: Use interpolation, not innerHTML

✅ **CORRECT**:

```html
<!-- Angular automatically escapes content -->
<p>{{ userInput }}</p>
<span>{{ userData.name }}</span>
```

❌ **WRONG**:

```html
<!-- Bypasses Angular's XSS protection -->
<div [innerHTML]="userInput"></div>
<!-- NEVER do this -->
```

### When innerHTML is needed

If you must render HTML (e.g., rich text from a trusted source):

```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-rich-text',
  template: `<div [innerHTML]="safeContent"></div>`,
})
export class RichTextComponent {
  safeContent: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  setContent(trustedHtml: string) {
    // Only use with TRUSTED content (e.g., from your own CMS)
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(trustedHtml);
  }
}
```

⚠️ **WARNING**: Only use `bypassSecurityTrustHtml` with content from **trusted sources** (your own CMS, admin-created content). NEVER use with user input.

---

## Angular Sanitization

### Built-in Sanitization Contexts

Angular sanitizes values in these contexts automatically:

| Context     | Method                           | Example                  |
| ----------- | -------------------------------- | ------------------------ |
| HTML        | `bypassSecurityTrustHtml`        | `[innerHTML]`            |
| Style       | `bypassSecurityTrustStyle`       | `[style]="dynamicStyle"` |
| Script      | `bypassSecurityTrustScript`      | Never recommended        |
| URL         | `bypassSecurityTrustUrl`         | `[src]="dynamicUrl"`     |
| ResourceUrl | `bypassSecurityTrustResourceUrl` | `<iframe [src]>`         |

### Safe Patterns

✅ **CORRECT**:

```typescript
// Safe: Angular escapes automatically
<img [src]="imageUrl" [alt]="imageAlt">
<a [href]="safeLink">Link</a>

// Safe: Using routerLink
<a [routerLink]="['/user', userId]">Profile</a>
```

❌ **WRONG**:

```typescript
// Dangerous: Direct DOM manipulation
document.getElementById('output').innerHTML = userInput;

// Dangerous: eval or Function constructor
eval(userCode);
new Function(userCode)();
```

---

## CSRF Protection

### Bearer Token Pattern (Recommended)

This project uses Bearer tokens in headers, which provides natural CSRF protection:

```typescript
// Automatically handled by AuthInterceptor
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
    return next.handle(req);
  }
}
```

**Why Bearer tokens prevent CSRF:**

- Tokens are stored in memory/localStorage, not cookies
- Attacker sites cannot access tokens from another origin
- Token must be explicitly added to requests

### Cookie-based Auth (If used)

If using cookies for auth, enable Angular's CSRF protection:

```typescript
// app.module.ts
import { HttpClientXsrfModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
  ],
})
export class AppModule {}
```

---

## Secure Form Handling

### Password Fields

✅ **CORRECT**:

```html
<!-- Use type="password" -->
<input type="password" formControlName="password" autocomplete="new-password" />

<!-- Don't show password in plain text -->
<input [type]="showPassword ? 'text' : 'password'" formControlName="password" />
```

### Form Validation

✅ **CORRECT**:

```typescript
// Client-side validation (for UX, not security)
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
});

// IMPORTANT: Server MUST also validate - client validation can be bypassed
```

### Sensitive Form Data

```typescript
// Don't store sensitive data in localStorage
localStorage.setItem('password', password); // ❌ NEVER

// Use memory-only for sensitive tokens
private accessToken: string | null = null; // ✅ Memory only

// Clear sensitive data on logout
logout() {
  this.accessToken = null;
  // Navigate away from protected pages
}
```

---

## Sensitive Data Handling

### Never Log Sensitive Data

```typescript
// ❌ WRONG
console.log('Password:', password);
this.logger.debug('User credentials', { password });

// ✅ CORRECT
this.logger.debug('Login attempt', { email: user.email });
```

### Mask Sensitive Display

```typescript
// Mask credit card
formatCardNumber(number: string): string {
  return `****-****-****-${number.slice(-4)}`;
}

// Mask email
formatEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}
```

### Clear Sensitive Data

```typescript
@Component({...})
export class PaymentComponent implements OnDestroy {
  private cardNumber = '';

  ngOnDestroy() {
    // Clear sensitive data when component is destroyed
    this.cardNumber = '';
    this.form.reset();
  }
}
```

---

## URL and Navigation Security

### Route Guards

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
```

### Safe URL Handling

✅ **CORRECT**:

```typescript
// Use routerLink for internal navigation
<a [routerLink]="['/user', userId]">Profile</a>

// Validate external URLs
openExternalLink(url: string) {
  const allowed = ['https://trusted-site.com', 'https://api.example.com'];
  if (allowed.some(domain => url.startsWith(domain))) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
```

❌ **WRONG**:

```typescript
// Dangerous: Direct assignment
window.location.href = userProvidedUrl;

// Dangerous: No validation
window.open(userProvidedUrl);
```

### Open External Links Safely

```html
<!-- Always use noopener,noreferrer for external links -->
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">External</a>
```

---

## Security Checklist

When creating frontend features, verify:

- [ ] User input is displayed via interpolation `{{ }}`, not `[innerHTML]`
- [ ] `bypassSecurityTrust*` only used with trusted content
- [ ] Passwords use `type="password"` input
- [ ] Sensitive data not stored in localStorage
- [ ] Sensitive data cleared on component destroy
- [ ] External links use `rel="noopener noreferrer"`
- [ ] Route guards protect authenticated routes
- [ ] Form validation for UX (server validates for security)
- [ ] No `console.log` with passwords or tokens
- [ ] Bearer token pattern for API authentication

---

## Troubleshooting

### Content not rendering (sanitization)

**Problem:** HTML content appears as plain text

**Cause:** Angular is sanitizing the content (this is good!)

**Solution:** Only bypass if content is from a trusted source:

```typescript
// Only for trusted admin/CMS content
this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(trustedContent);
```

### CORS errors on API calls

**Problem:** API calls blocked by browser

**Cause:** Backend not allowing frontend origin

**Solution:** Configure CORS on backend:

```typescript
// Backend main.ts
app.enableCors({
  origin: ['http://localhost:4200'],
  credentials: true,
});
```

### Token not being sent

**Problem:** API returns 401 Unauthorized

**Check:**

1. Token stored correctly after login
2. AuthInterceptor is registered
3. Interceptor adds Bearer token

```typescript
// Check interceptor is provided
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```

---

**Related Files:**

- [logging-guide.md](logging-guide.md) - Frontend logging patterns

**References:**

- [Angular Security Guide](https://angular.io/guide/security)
- Auth interceptor: `apps/web-ui/src/app/core/interceptors/`
- Route guards: `apps/web-ui/src/app/core/guards/`
