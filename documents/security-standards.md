# Security Best Practices for AI Code Generation

## Description

Security guidelines for AI assistants when generating code for AI-Nx-Starter. These rules help prevent common vulnerabilities and ensure secure-by-default implementations.

---

## Critical Security Rules

### 1. Input Validation - ALWAYS Required

**RULE**: Every DTO must use class-validator decorators.

✅ **CORRECT**:

```typescript
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@ai-nx-starter/types';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(Role)
  role: Role;
}
```

❌ **WRONG**:

```typescript
export class CreateUserDto {
  email: string; // No validation!
  password: string; // No minimum length!
  phone?: string; // Unvalidated
}
```

**When generating DTOs**:

- Add appropriate validators for every field
- Use `@IsOptional()` for optional fields
- Use `@IsEnum()` for enums, not just `@IsString()`
- Use specific validators: `@IsEmail()`, `@IsUrl()`, `@IsUUID()`, etc.
- Use `@Min()`, `@Max()` for numbers
- Use `@MinLength()`, `@MaxLength()` for strings
- Use `@IsArray()`, `@ArrayMinSize()` for arrays

### 2. Authorization - ALWAYS Required

**RULE**: Every controller endpoint must have explicit authorization.

✅ **CORRECT**:

```typescript
import { Authorize, Session, SessionInfo, IgnoreAuthorization } from '@ai-nx-starter/backend-common';
import { Role } from '@ai-nx-starter/types';

@Controller('users')
export class UserController {
  @Get()
  @Authorize(Role.Admin) // ✅ Explicit authorization
  async getAll(@Session() session: SessionInfo) {
    return this.userService.findAll();
  }

  @Get('public')
  @IgnoreAuthorization() // ✅ Explicitly public
  async getPublic() {
    return { status: 'ok' };
  }
}
```

❌ **WRONG**:

```typescript
@Controller('users')
export class UserController {
  @Get() // ❌ No authorization! Defaults to Root
  async getAll() {
    return this.userService.findAll();
  }
}
```

**Authorization Guidelines**:

- Use `@Authorize(Role.Admin)` for standard protected endpoints
- Use `@Authorize(Role.Root)` for sensitive operations
- Use `@IgnoreAuthorization()` ONLY for truly public endpoints
- ALWAYS inject `@Session() session: SessionInfo` for protected endpoints
- Validate resource ownership in service layer

### 3. Never Expose Sensitive Data

**RULE**: Exclude passwords and sensitive fields from responses.

✅ **CORRECT**:

```typescript
// DTO for responses
export class ClientUserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  // ✅ No password, no internal fields
}

// Service method
async findById(id: string): Promise<ClientUserDto> {
  const user = await this.userDbService.findById(id);  // Password excluded by entity
  return this.mapToDto(user);
}
```

❌ **WRONG**:

```typescript
// DTO with sensitive data
export class UserDto {
  id: string;
  email: string;
  password: string; // ❌ NEVER include password
  internalNotes: string; // ❌ Internal data exposed
  ssn: string; // ❌ PII exposed
}
```

**When generating DTOs**:

- Create separate DTOs for requests vs responses
- Response DTOs should only include client-safe fields
- Use mapper services to transform entities to DTOs
- NEVER return entity objects directly to client

### 4. Prevent Data Access Violations

**RULE**: NEVER use TypeORM directly in web-server.

✅ **CORRECT**:

```typescript
// In web-server
import { UserDbService } from '@ai-nx-starter/data-access-layer';

@Injectable()
export class UserService {
  constructor(private readonly userDbService: UserDbService) {}

  async findById(id: string) {
    return this.userDbService.findById(id); // ✅ Use DbService
  }
}
```

❌ **WRONG**:

```typescript
// In web-server
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) // ❌ Direct TypeORM in web-server
    private userRepository: Repository<UserEntity>,
  ) {}
}
```

**Data Access Rules**:

- TypeORM ONLY in `packages/data-access-layer`
- web-server imports DbServices from `@ai-nx-starter/data-access-layer`
- No raw queries with string concatenation
- Use TypeORM query builders, not raw SQL/NoSQL

### 5. Secure Error Handling

**RULE**: Never expose internal details in error messages.

✅ **CORRECT**:

```typescript
async login(email: string, password: string) {
  const user = await this.userDbService.findByEmail(email);

  if (!user || !await this.verifyPassword(password, user.password)) {
    // ✅ Generic message, detailed server log
    this.logger.warn(`Login failed for ${email}`);
    throw new UnauthorizedException('Invalid email or password');
  }
}
```

❌ **WRONG**:

```typescript
async login(email: string, password: string) {
  const user = await this.userDbService.findByEmail(email);

  if (!user) {
    throw new UnauthorizedException('Email not found');  // ❌ Reveals email exists
  }

  if (!await this.verifyPassword(password, user.password)) {
    throw new UnauthorizedException('Password incorrect');  // ❌ Reveals email exists
  }
}
```

**Error Handling Guidelines**:

- Use generic error messages to client
- Log detailed errors server-side with `this.logger`
- Use structured exceptions from `@ai-nx-starter/backend-common`
- Don't expose stack traces in production
- Don't reveal database structure or internal paths

### 6. Authorization in Business Logic

**RULE**: Validate resource ownership before operations.

✅ **CORRECT**:

```typescript
@Injectable()
export class DocumentService {
  async updateDocument(id: string, updates: UpdateDocumentDto, session: SessionInfo) {
    const doc = await this.documentDbService.findById(id);

    // ✅ Ownership check
    if (doc.ownerId !== session.userId && session.role !== Role.Root) {
      throw new ForbiddenException('Not authorized to update this document');
    }

    return this.documentDbService.update(id, updates);
  }
}
```

❌ **WRONG**:

```typescript
@Injectable()
export class DocumentService {
  async updateDocument(id: string, updates: UpdateDocumentDto) {
    // ❌ No ownership check - anyone can update any document!
    return this.documentDbService.update(id, updates);
  }
}
```

**Business Logic Security**:

- Check resource ownership in service methods
- Don't rely solely on route guards
- Allow Root role to bypass ownership checks (if appropriate)
- Validate user can perform action on specific resource
- Log security violations

### 7. Prevent Mass Assignment

**RULE**: Use DTOs with whitelist, never accept raw objects.

✅ **CORRECT**:

```typescript
// DTO with only updatable fields
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
  // ✅ Only safe fields, role NOT included
}

@Put(':id')
async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
  return this.userService.update(id, dto);  // ✅ Only DTO fields accepted
}
```

❌ **WRONG**:

```typescript
@Put(':id')
async update(@Param('id') id: string, @Body() updates: any) {
  // ❌ Client could send { role: 'Root' } and escalate privileges!
  return this.userService.update(id, updates);
}
```

**Mass Assignment Prevention**:

- ValidationPipe configured with `whitelist: true` (strips unknown props)
- Create separate DTOs for create vs update operations
- Never use `any` type for request bodies
- Don't expose internal/admin-only fields in update DTOs

### 8. Password Security

**RULE**: Always hash passwords, never store plain text.

✅ **CORRECT**:

```typescript
import * as bcrypt from 'bcrypt';

async createUser(dto: CreateUserDto) {
  // ✅ Hash before storing
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = await this.userDbService.create({
    ...dto,
    password: hashedPassword
  });

  // ✅ Remove password from response
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);  // ✅ Use bcrypt compare
}
```

❌ **WRONG**:

```typescript
async createUser(dto: CreateUserDto) {
  // ❌ Storing plain text password!
  const user = await this.userDbService.create(dto);
  return user;  // ❌ Password included in response
}

async verifyPassword(plain: string, hashed: string) {
  return plain === hashed;  // ❌ Plain text comparison
}
```

**Password Guidelines**:

- Use bcrypt with salt rounds >= 10
- Hash on create and password update
- Use `bcrypt.compare()` for verification, never direct comparison
- Exclude password field from entity queries (use `select: false`)
- Never log passwords
- Never return passwords in API responses

### 9. CORS and Security Headers

**RULE**: Configure CORS for specific origins in production.

✅ **CORRECT** (Production):

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

❌ **WRONG**:

```typescript
app.enableCors({
  origin: '*', // ❌ Allows any origin in production!
  credentials: true,
});
```

**CORS Configuration**:

- Use specific origins in production (from environment variable)
- `origin: '*'` only acceptable for development
- Include credentials only if needed
- Limit HTTP methods to required ones
- Security headers already configured via Helmet

### 10. Rate Limiting and DoS Prevention

**RULE**: Implement rate limiting on authentication endpoints.

✅ **CORRECT** (Future implementation):

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle(5, 60) // ✅ 5 attempts per 60 seconds
  @IgnoreAuthorization()
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
}
```

**Rate Limiting Guidelines**:

- Limit login attempts (e.g., 5 per minute per IP)
- Limit password reset requests
- Consider per-user rate limits for expensive operations
- TODO: Install `@nestjs/throttler` and configure globally

---

## Common Vulnerabilities to Prevent

### XSS (Cross-Site Scripting)

- ✅ Angular sanitizes by default in templates
- ✅ Use `{{ }}` for text interpolation, not `[innerHTML]`
- ✅ CSP headers configured via Helmet
- ❌ NEVER use `bypassSecurityTrustHtml()` with user input

### SQL/NoSQL Injection

- ✅ Use TypeORM query builders
- ✅ Validate all inputs with class-validator
- ✅ Use parameterized queries
- ❌ NEVER concatenate user input into queries

### IDOR (Insecure Direct Object References)

- ✅ Validate resource ownership before operations
- ✅ Check `session.userId` matches resource owner
- ✅ Use UUIDs for IDs, not sequential integers
- ❌ NEVER trust client-provided IDs without validation

### Session Fixation

- ✅ Generate new token on login (already implemented)
- ✅ Invalidate old sessions on logout
- ✅ Consider rotating session on privilege change

### CSRF (Cross-Site Request Forgery)

- ✅ Use Bearer tokens in headers (not cookies)
- ✅ Validate Origin/Referer for state-changing operations
- ✅ Angular has built-in CSRF protection for cookie-based auth

---

## Code Generation Checklist

When generating new endpoints or features, ALWAYS include:

- [ ] Input validation with class-validator DTOs
- [ ] `@Authorize(Role.X)` decorator on controller methods
- [ ] `@Session() session: SessionInfo` parameter for protected endpoints
- [ ] Ownership validation in service layer
- [ ] Sensitive data excluded from response DTOs
- [ ] Structured error handling (no internal details exposed)
- [ ] TypeORM only in data-access-layer (use DbService in web-server)
- [ ] Password hashing with bcrypt (if applicable)
- [ ] Tests include authorization scenarios
- [ ] No `any` types without validation

---

## Example: Secure CRUD Implementation

```typescript
// DTO
export class CreateDocumentDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class DocumentDto {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  // No internal fields
}

// Controller
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @Authorize(Role.Admin)
  async findAll(@Session() session: SessionInfo): Promise<DocumentDto[]> {
    return this.documentService.findAll(session);
  }

  @Get(':id')
  @Authorize(Role.Admin)
  async findOne(@Param('id') id: string, @Session() session: SessionInfo): Promise<DocumentDto> {
    return this.documentService.findOne(id, session);
  }

  @Post()
  @Authorize(Role.Admin)
  async create(@Body() dto: CreateDocumentDto, @Session() session: SessionInfo): Promise<DocumentDto> {
    return this.documentService.create(dto, session);
  }

  @Put(':id')
  @Authorize(Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @Session() session: SessionInfo): Promise<DocumentDto> {
    return this.documentService.update(id, dto, session);
  }

  @Delete(':id')
  @Authorize(Role.Admin)
  async delete(@Param('id') id: string, @Session() session: SessionInfo): Promise<void> {
    await this.documentService.delete(id, session);
  }
}

// Service
@Injectable()
export class DocumentService {
  constructor(
    private readonly documentDbService: DocumentDbService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(DocumentService.name);
  }

  async findAll(session: SessionInfo): Promise<DocumentDto[]> {
    // Non-Root users only see their own documents
    if (session.role !== Role.Root) {
      return this.documentDbService.findByOwnerId(session.userId);
    }
    return this.documentDbService.findAll();
  }

  async findOne(id: string, session: SessionInfo): Promise<DocumentDto> {
    const doc = await this.documentDbService.findById(id);

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    // Ownership check
    if (doc.ownerId !== session.userId && session.role !== Role.Root) {
      throw new ForbiddenException('Not authorized to view this document');
    }

    return this.mapToDto(doc);
  }

  async create(dto: CreateDocumentDto, session: SessionInfo): Promise<DocumentDto> {
    const doc = await this.documentDbService.create({
      ...dto,
      ownerId: session.userId, // Set owner to current user
    });

    this.logger.info(`Document created by ${session.email}: ${doc.id}`);
    return this.mapToDto(doc);
  }

  async update(id: string, dto: UpdateDocumentDto, session: SessionInfo): Promise<DocumentDto> {
    const doc = await this.documentDbService.findById(id);

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    // Ownership check
    if (doc.ownerId !== session.userId && session.role !== Role.Root) {
      throw new ForbiddenException('Not authorized to update this document');
    }

    const updated = await this.documentDbService.update(id, dto);
    this.logger.info(`Document updated by ${session.email}: ${id}`);
    return this.mapToDto(updated);
  }

  async delete(id: string, session: SessionInfo): Promise<void> {
    const doc = await this.documentDbService.findById(id);

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    // Ownership check
    if (doc.ownerId !== session.userId && session.role !== Role.Root) {
      throw new ForbiddenException('Not authorized to delete this document');
    }

    await this.documentDbService.delete(id);
    this.logger.info(`Document deleted by ${session.email}: ${id}`);
  }

  private mapToDto(entity: DocumentEntity): DocumentDto {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      ownerId: entity.ownerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
```

---

## Related Documentation

- **Auth/Session Model**: `documents/auth-session-architecture.md` - How authentication works
- **Security Policy**: `SECURITY.md` - Security policy and production checklist
- **Web Server**: `documents/web-server-architecture.md` - Web server architecture
- **API Documentation**: `documents/api-documentation-standards.md` - Swagger patterns and standards

---

**Remember**: Security is not optional. ALWAYS follow these guidelines when generating code.

**Last Updated**: 2025-11-11
**Applies to**: AI-Nx-Starter v1.3.0+
