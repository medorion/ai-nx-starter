# Controllers - Best Practices

Complete guide to clean route definitions and controller patterns.

## Table of Contents

- [Controllers Golden Rules](#controllers-golden-rules)
- [Input Validation Flow](#input-validation-flow)
- [Query Parameters](#query-parameters)
- [Good Examples](#good-examples)
- [Error Handling](#error-handling)
- [HTTP Status Codes](#http-status-codes)

---

## Controllers Golden Rules

**Controllers should ONLY:**

- ✅ Define route paths (@Controller('users'), @Get(), @Post())
- ✅ Apply guards/decorators (@Authorize(Role.Admin), @ApiBearerAuth())
- ✅ Accept input via parameter decorators (@Body(), @Param(), @Query())
- ✅ Add Swagger documentation (@ApiOperation, @ApiResponse)
- ✅ Delegate to services
- ✅ Return DTOs

**Controllers should NEVER:**

- ❌ Contain business logic (belongs in services)
- ❌ Access database directly (use services → DbService)
- ❌ Write validation logic manually (validation is automatic via ValidationPipe + class-validator in DTOs)
- ❌ Transform entities to DTOs (use Mapper in service)
- ❌ Call DbService directly (always go through service layer)
- ❌ Use @ApiProperty in DTOs (Swagger decorators only in controllers)

## Input Validation Flow

```
1. DTOs define validation rules (class-validator decorators)
   └── packages/types/src/dto/create-user.dto.ts
       @IsEmail() email: string;

2. Controller accepts input
   └── @Body() createUserDto: CreateUserDto

3. ValidationPipe validates automatically (NestJS built-in)
   └── If invalid → 400 Bad Request (automatic)
   └── If valid → Controller method executes
```

**Summary:**

- DTOs = Define validation rules (@IsEmail(), @MinLength())
- Controllers = Accept input (@Body()) - validation happens automatically
- ValidationPipe = Executes the validation (NestJS magic)

---

## Query Parameters

### CRITICAL: API Client Generator Constraint

**NEVER use DTO objects with @Query(ValidationPipe)** - The API client generator cannot expand DTOs into individual query parameters.

This is a critical constraint specific to this codebase's API client generation tool.

### The Problem

❌ **WRONG** (causes API client to fail):

```typescript
@Get()
async findAll(@Query(ValidationPipe) query: QueryActivityLogsDto): Promise<QueryResultDto<ActivityLogDto>> {
  return this.activityLogService.findAll(query);
}
```

**What happens:**

- The API client generator doesn't know how to expand the DTO into query parameters
- It treats the entire DTO as a single parameter and calls `.toString()` on it
- Results in: `?ValidationPipe=[object Object]`
- Backend receives `400 Bad Request` because it can't parse the query

### The Solution

✅ **CORRECT** (API client generates proper query params):

```typescript
@Get()
@ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
@ApiQuery({ name: 'pageSize', required: false, description: 'Items per page', example: 50 })
@ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
@ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
async findAll(
  @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  @Query('userId') userId?: string,
  @Query('status') status?: string,
): Promise<QueryResultDto<ActivityLogDto>> {
  // Manually construct DTO inside controller
  const query: QueryActivityLogsDto = { page, pageSize, userId, status };
  return this.activityLogService.findAll(query);
}
```

**What happens:**

- API client generator reads each `@Query('paramName')` decorator
- Generates proper HTTP query parameters: `?page=1&pageSize=50&userId=abc&status=active`
- Backend receives correct query parameters

### Key Patterns

**1. Use individual @Query() decorators:**

```typescript
// ✅ Each parameter gets its own decorator
@Query('page', new ParseIntPipe({ optional: true })) page?: number
@Query('userId') userId?: string
```

**2. Use ParseIntPipe for optional numbers:**

```typescript
// ✅ Correctly parses query string to number
@Query('page', new ParseIntPipe({ optional: true })) page?: number

// ❌ Would receive string "1" instead of number 1
@Query('page') page?: number
```

**3. Manually construct DTO in controller:**

```typescript
// ✅ Controller builds DTO from individual params
const query: QueryActivityLogsDto = { page, pageSize, userId, status };
return this.service.findAll(query);
```

**4. Add @ApiQuery for each parameter:**

```typescript
// ✅ Documents each query param in Swagger
@ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
@ApiQuery({ name: 'pageSize', required: false, description: 'Items per page', example: 50 })
```

### Real-World Example

**File**: `apps/web-server/src/app/features/activity-log/activity-log.controller.ts`

```typescript
@ApiOperation({ summary: 'Get all activity logs' })
@ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
@ApiQuery({ name: 'pageSize', required: false, description: 'Items per page (default: 50, max: 100)', example: 50 })
@ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID', example: 'user-123' })
@ApiQuery({ name: 'action', required: false, description: 'Filter by action', example: 'USER_CREATED' })
@ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type', example: 'User' })
@ApiQuery({ name: 'startDate', required: false, description: 'Start date for filtering (ISO 8601)', example: '2025-01-01T00:00:00Z' })
@ApiQuery({ name: 'endDate', required: false, description: 'End date for filtering (ISO 8601)', example: '2025-12-31T23:59:59Z' })
@ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by (default: timestamp)', example: 'timestamp' })
@ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC or DESC)', enum: ['ASC', 'DESC'] })
@Authorize(Role.Admin)
@Get()
async findAll(
  @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  @Query('userId') userId?: string,
  @Query('action') action?: string,
  @Query('entityType') entityType?: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('sortBy') sortBy?: string,
  @Query('sortOrder') sortOrder?: string,
): Promise<QueryResultDto<ActivityLogDto>> {
  const query: QueryActivityLogsDto = {
    page,
    pageSize,
    userId,
    action,
    entityType,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    sortBy,
    sortOrder: sortOrder as any,
  };
  return await this.activityLogService.findAll(query);
}
```

### Why This Pattern Exists

**API Client Generation Tool:**

- The tool (`tools/api-client-generator/src/generate.ts`) reads controller decorators
- It looks for individual `@Query('paramName')` decorators to generate TypeScript methods
- It cannot introspect DTO class properties at runtime
- When it sees `@Query(ValidationPipe)`, it treats the entire parameter as a single query param

**Frontend Result:**

```typescript
// Generated in packages/api-client/src/api/features/activity-log/api-activity-log.service.ts
findAll(
  page?: number,
  pageSize?: number,
  userId?: string,
  action?: string,
  entityType?: string,
  startDate?: string,
  endDate?: string,
  sortBy?: string,
  sortOrder?: string,
): Observable<QueryResultDto<ActivityLogDto>> {
  let params = new HttpParams();
  if (page !== undefined) params = params.set('page', page.toString());
  if (pageSize !== undefined) params = params.set('pageSize', pageSize.toString());
  // ... etc for all parameters
  return this.http.get<QueryResultDto<ActivityLogDto>>(`${this.BASE_URL}/activity-logs`, { params });
}
```

### After Controller Changes

**ALWAYS regenerate the API client:**

```bash
npm run gen-api-client
```

This ensures the frontend has type-safe methods matching your backend API.

---

## Good Examples

### Example 1: User Controller (Excellent ✅)

**File**: apps/web-server/src/app/features/user/user.controller.ts

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto, ClientUserDto, Role } from '@ai-nx-starter/types';
import { Authorize } from '@ai-nx-starter/backend-common';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Authorize(Role.Admin)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [ClientUserDto] })
  async findAll(): Promise<ClientUserDto[]> {
    return this.userService.findAll();
  }
  @Get(':id')
  @Authorize(Role.Admin)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found', type: ClientUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<ClientUserDto> {
    return this.userService.findOne(id);
  }
  @Post()
  @Authorize(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created', type: ClientUserDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<ClientUserDto> {
    return this.userService.create(createUserDto);
  }
  @Put(':id')
  @Authorize(Role.Admin)
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated', type: ClientUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ClientUserDto> {
    return this.userService.update(id, updateUserDto);
  }
  @Delete(':id')
  @Authorize(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
```

**What Makes This Excellent:**

- ✅ Zero business logic - pure delegation to service
- ✅ Complete Swagger documentation on every endpoint
- ✅ Authorization via @Authorize() decorator
- ✅ Proper HTTP status codes (@HttpCode)
- ✅ Consistent pattern across all CRUD operations
- ✅ Uses DTOs from @ai-nx-starter/types
- ✅ Documents both success and error responses
- ✅ Clean, readable, single responsibility
- ✅ Uses @ApiBearerAuth() to document authentication requirement

---

### Example 2: Product Controller (Good ✅)

**File**: apps/web-server/src/app/features/product/product.controller.ts

```typescript
import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateProductDto, ProductDto } from '@ai-nx-starter/types';
import { ProductDbService } from '@ai-nx-starter/data-access-layer';
import { ProductMapper } from './product.mapper';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productDbService: ProductDbService,
    private readonly productMapper: ProductMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async findAll(): Promise<ProductDto[]> {
    const products = await this.productDbService.findAll();
    return products.map((p) => this.productMapper.toDto(p));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string): Promise<ProductDto> {
    const product = await this.productDbService.findById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return this.productMapper.toDto(product);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductDto> {
    const product = await this.productDbService.create(createProductDto);
    return this.productMapper.toDto(product);
  }
}
```

**What Makes This Good:**

- ✅ Uses Swagger decorators
- ✅ Uses DTOs from shared types package
- ✅ Clean controller structure

**Could Be Better:**

- ❌ Calls DbService directly - should use a ProductService layer
- ❌ Mapper called in controller - transformation should happen in service
- ❌ Exception thrown in controller - the null check and NotFoundException should be in the service
- ❌ Missing authorization - no @Authorize() decorator
- ❌ Incomplete Swagger - missing @ApiResponse for error cases
- ❌ Missing @HttpCode - POST should return 201
- ❌ Missing @ApiBearerAuth() - should document authentication requirement

---

## Error Handling

### NestJS Exception Flow

In NestJS, error handling is automatic via exception filters:

```
Service throws exception → Exception Filter catches → Formats HTTP response
```

**Key Principles:**

- ✅ Services throw business exceptions (`NotFoundException`, `ConflictException`)
- ✅ Controllers delegate - no try/catch needed
- ✅ Global exception filter formats all error responses
- ✅ Exceptions bubble up automatically
- ❌ No manual `handleError()` methods needed
- ❌ No try/catch blocks in controllers

### Where Exceptions Should Originate

**Services throw exceptions (correct):**

```typescript
// user.service.ts
async findOne(id: string): Promise<ClientUserDto> {
  const user = await this.userDbService.findById(id);
  if (!user) {
    throw new NotFoundException(`User with id ${id} not found`);
  }
  return this.userMapper.toDto(user);
}

async create(dto: CreateUserDto): Promise<ClientUserDto> {
  const existing = await this.userDbService.findByEmail(dto.email);
  if (existing) {
    throw new ConflictException(`Email ${dto.email} already exists`);
  }
  const user = await this.userDbService.create(dto);
  return this.userMapper.toDto(user);
}
```

**Controllers delegate (correct):**

```typescript
// user.controller.ts
@Get(':id')
async findOne(@Param('id') id: string): Promise<ClientUserDto> {
  return this.userService.findOne(id); // Service throws if not found
}

@Post()
async create(@Body() dto: CreateUserDto): Promise<ClientUserDto> {
  return this.userService.create(dto); // Service throws if conflict
}
```

### Common NestJS Exceptions

| Exception                      | HTTP Status | Use Case                          |
| ------------------------------ | ----------- | --------------------------------- |
| `BadRequestException`          | 400         | Invalid input (beyond validation) |
| `UnauthorizedException`        | 401         | Not authenticated                 |
| `ForbiddenException`           | 403         | Not authorized                    |
| `NotFoundException`            | 404         | Resource not found                |
| `ConflictException`            | 409         | Duplicate resource                |
| `InternalServerErrorException` | 500         | Unexpected errors                 |

---

## HTTP Status Codes

### Standard Codes

| Code | Use Case              | Example                 |
| ---- | --------------------- | ----------------------- |
| 200  | Success (GET, PUT)    | User retrieved, Updated |
| 201  | Created (POST)        | User created            |
| 204  | No Content (DELETE)   | User deleted            |
| 400  | Bad Request           | Invalid input data      |
| 401  | Unauthorized          | Not authenticated       |
| 403  | Forbidden             | No permission           |
| 404  | Not Found             | Resource doesn't exist  |
| 409  | Conflict              | Duplicate resource      |
| 422  | Unprocessable Entity  | Validation failed       |
| 500  | Internal Server Error | Unexpected error        |

### Usage Examples

**201 Created (POST):**

```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() dto: CreateUserDto): Promise<ClientUserDto> {
  return this.userService.create(dto);
}
```

**204 No Content (DELETE):**

```typescript
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async remove(@Param('id') id: string): Promise<void> {
  return this.userService.remove(id);
}
```

**404 Not Found (Service throws):**

```typescript
// In service:
async findOne(id: string): Promise<ClientUserDto> {
  const user = await this.userDbService.findById(id);
  if (!user) {
    throw new NotFoundException(`User with id ${id} not found`);
  }
  return this.userMapper.toDto(user);
}
```

**409 Conflict (Duplicate resource):**

```typescript
// In service:
async create(dto: CreateUserDto): Promise<ClientUserDto> {
  const existing = await this.userDbService.findByEmail(dto.email);
  if (existing) {
    throw new ConflictException(`Email ${dto.email} already exists`);
  }
  return this.userMapper.toDto(await this.userDbService.create(dto));
}
```

**400 Bad Request (Invalid input beyond validation):**

```typescript
// In service:
async updateStatus(id: string, status: string): Promise<ClientUserDto> {
  const user = await this.userDbService.findById(id);
  if (user.status === 'deleted') {
    throw new BadRequestException('Cannot update a deleted user');
  }
  return this.userMapper.toDto(await this.userDbService.update(id, { status }));
}
```

**403 Forbidden (No permission):**

```typescript
// In service:
async delete(id: string, requesterId: string): Promise<void> {
  const user = await this.userDbService.findById(id);
  if (user.ownerId !== requesterId) {
    throw new ForbiddenException('You can only delete your own resources');
  }
  await this.userDbService.delete(id);
}
```

---

**Related Files:**

- [SKILL.md](../SKILL.md) - Main guide
- [types-guide.md](types-guide.md) - Types Package, DTOs, enums, constants, validation
- [services-guide.md](services-guide.md) - Service patterns
- [architecture-overview.md](architecture-overview.md) - Layered architecture
- [auth-session-guide.md](auth-session-guide.md) - Authentication and authorization
- [security-guide.md](security-guide.md) - Input validation, authorization, security patterns
- [api-documentation-guide.md](api-documentation-guide.md) - Swagger documentation patterns
- [testing-guide.md](testing-guide.md) - AI testing guidelines
- [code-coverage-guide.md](code-coverage-guide.md) - Coverage exclusion guidelines
