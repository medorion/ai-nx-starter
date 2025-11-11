# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of AI-Nx-Starter seriously. If you discover a security vulnerability, please follow these steps:

### Where to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **[security@your-domain.com]** (replace with actual email)

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Initial Response**: Within 48 hours, we will acknowledge receipt of your vulnerability report
- **Investigation**: We will investigate and validate the issue (typically within 5 business days)
- **Updates**: We will keep you informed about the progress of fixing the vulnerability
- **Disclosure**: Once fixed, we will coordinate disclosure timing with you
- **Credit**: We will credit you in the release notes (unless you prefer to remain anonymous)

## Security Best Practices for Users

### Environment Variables

- Never commit `.env` files to version control
- Use `.env.example` as a template
- Store sensitive credentials in secure vaults (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate credentials regularly

### Database Security

- Use strong passwords for database users
- Apply principle of least privilege to database accounts
- Enable SSL/TLS for database connections in production
- Regularly backup your database with encryption
- Keep TypeORM and database drivers up to date

### Session & Authentication

- The default session configuration is for development only
- For production:
  - Use secure session stores (Redis, PostgreSQL)
  - Set `secure: true` for cookies (HTTPS only)
  - Configure appropriate `maxAge` for sessions
  - Implement rate limiting on authentication endpoints
  - Consider implementing MFA (Multi-Factor Authentication)

### API Security

- Implement rate limiting for public endpoints
- Validate and sanitize all user inputs (class-validator helps but isn't foolproof)
- Use CORS properly - don't allow all origins in production
- Implement proper CSP (Content Security Policy) headers
- Keep all dependencies updated

### Docker Security

- Don't run containers as root in production
- Scan Docker images for vulnerabilities regularly
- Use minimal base images (alpine variants where possible)
- Don't expose unnecessary ports
- Keep Docker and base images updated

## Known Security Considerations

### Current Implementation Notes

1. **Session Storage**: Default uses in-memory storage (development only)
   - Production deployments MUST use Redis or database-backed sessions

2. **CORS Configuration**: Configured in `apps/web-server/src/main.ts`
   - Review and restrict origins for production

3. **Rate Limiting**: Not currently implemented
   - Consider adding `@nestjs/throttler` for production use

4. **Input Validation**: Uses class-validator
   - Ensure all DTOs have proper validation decorators
   - Don't trust client-side validation alone

5. **Dependencies**: Regular security audits recommended
   - Run `npm audit` regularly
   - Consider setting up Dependabot or Snyk

## Security Headers

**Implemented using Helmet**: Security headers are now configured in `apps/web-server/src/main.ts` using the `helmet` package.

The following security headers are automatically applied:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 0 (disabled by helmet as modern browsers use CSP)
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; ...
Referrer-Policy: no-referrer
Permissions-Policy: (set by helmet defaults)
```

**Configuration Notes**:
- `styleSrc: 'unsafe-inline'` is enabled for NG-ZORRO/Angular Material compatibility
- `crossOriginEmbedderPolicy` is disabled for development compatibility
- CSP allows `data:` and `https:` for images to support common use cases
- HSTS preload is enabled for maximum security

**For Production**:
- Review and adjust CSP directives based on your specific frontend needs
- Consider enabling `crossOriginEmbedderPolicy` if not using third-party resources
- You can also configure additional headers in your reverse proxy (nginx, Apache, etc.)

## Audit Logs

For compliance and security monitoring:

- Log all authentication attempts (success and failure)
- Log authorization failures
- Log sensitive data access
- Implement log rotation and retention policies
- Consider centralized logging (ELK, Datadog, CloudWatch, etc.)

## Updates and Patches

- Subscribe to GitHub releases to get notified of security updates
- Review CHANGELOG.md for security-related changes
- Test updates in staging before applying to production
- Have a rollback plan for updates

## Third-Party Security

This project uses several third-party dependencies. Key security-sensitive ones:

- **NestJS**: Web framework - keep updated for security patches
- **TypeORM**: Database ORM - SQL injection risks if misused
- **Angular**: Frontend framework - XSS protection built-in but validate usage
- **class-validator**: Input validation - must be properly configured
- **express-session**: Session management - production config critical

Monitor these projects for security advisories.

## Compliance

This starter kit does not make any compliance guarantees (GDPR, HIPAA, SOC2, etc.). If you need compliance:

- Conduct your own security audit
- Implement additional controls as required
- Consult with security and legal professionals
- Document your compliance measures

## Questions

For security questions that are not sensitive, you can:

- Open a GitHub Discussion
- Check existing documentation in `/documents` and `/prompts` directories

For sensitive security matters, use the private reporting email above.

---

**Last Updated**: 2025-11-11
**Version**: 1.0
