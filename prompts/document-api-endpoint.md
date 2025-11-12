# Document API Endpoint with Swagger

Use this prompt template when adding Swagger documentation to a new or existing API endpoint.

## Prerequisites

- Endpoint already implemented in controller
- DTOs created and validated
- `@nestjs/swagger` package installed (already done in this project)

## Prompt Template

```
Document the [ENDPOINT_NAME] endpoint in [CONTROLLER_NAME] with Swagger decorators following the project's API documentation standards.

Endpoint details:
- Method: [HTTP_METHOD]
- Path: [ENDPOINT_PATH]
- Purpose: [BRIEF_DESCRIPTION]
- Authorization: [Required/Optional, Role if required]
- Request body: [DTO_NAME or N/A]
- Response: [DTO_NAME or description]

Requirements:
1. Add @ApiOperation with clear summary and description
2. Add @ApiResponse for all status codes (success and errors)
3. Add @ApiParam for path parameters (with examples)
4. Add @ApiQuery for query parameters (with examples)
5. Add @ApiBody for request body (reference DTO or inline schema)
6. Add @ApiBearerAuth('bearer') if authentication required
7. Ensure controller has @ApiTags decorator
8. Add @ApiProperty decorators to any DTOs used

Follow the patterns in:
- apps/web-server/src/app/features/user/user.controller.ts (comprehensive CRUD)
- apps/web-server/src/app/auth/auth.controller.ts (authentication patterns)
- apps/web-server/src/app/features/sync-events/sync-events.controller.ts (SSE patterns)
```

## Example Usage

### Example 1: Simple GET Endpoint

```
Document the getProducts endpoint in ProductController with Swagger decorators following the project's API documentation standards.

Endpoint details:
- Method: GET
- Path: /products
- Purpose: Retrieve all products with optional pagination
- Authorization: Required, Admin role
- Request body: N/A
- Query params: limit (optional), offset (optional)
- Response: Array of ProductDto

Requirements:
1. Add @ApiOperation with clear summary and description
2. Add @ApiResponse for all status codes (200, 401, 403)
3. Add @ApiQuery for limit and offset parameters
4. Add @ApiBearerAuth('bearer') since authentication required
5. Ensure ProductController has @ApiTags('Products')
6. Add @ApiProperty decorators to ProductDto
```

**Expected Output:**

```typescript
@ApiTags('Products')
@ApiBearerAuth('bearer')
@Controller('products')
export class ProductController {
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve list of all products with optional pagination. Requires Admin role.',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of products to return', example: 10 })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of products to skip', example: 0 })
  @ApiResponse({ status: 200, description: 'Successfully retrieved products', type: [ProductDto] })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions (requires Admin)' })
  @Authorize(Role.Admin)
  @Get()
  async getProducts(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<ProductDto[]> {
    return await this.productService.findAll(limit, offset);
  }
}
```

---

### Example 2: POST Endpoint with Request Body

```
Document the createProduct endpoint in ProductController with Swagger decorators following the project's API documentation standards.

Endpoint details:
- Method: POST
- Path: /products
- Purpose: Create a new product
- Authorization: Required, Admin role
- Request body: CreateProductDto
- Response: ProductDto

Requirements:
1. Add @ApiOperation with clear summary and description
2. Add @ApiResponse for status codes (201, 400, 401, 403)
3. Add @ApiBody({ type: CreateProductDto })
4. Add @ApiBearerAuth('bearer')
5. Add @ApiProperty decorators to CreateProductDto
```

**Expected Output:**

```typescript
@ApiOperation({
  summary: 'Create product',
  description: 'Create a new product. Name must be unique. Requires Admin role.'
})
@ApiBody({ type: CreateProductDto })
@ApiResponse({ status: 201, description: 'Product successfully created', type: ProductDto })
@ApiResponse({ status: 400, description: 'Validation failed or name already exists' })
@ApiResponse({ status: 401, description: 'Not authenticated' })
@ApiResponse({ status: 403, description: 'Insufficient permissions (requires Admin)' })
@ApiBearerAuth('bearer')
@Authorize(Role.Admin)
@Post()
@HttpCode(HttpStatus.CREATED)
async createProduct(@Body(ValidationPipe) createProductDto: CreateProductDto): Promise<ProductDto> {
  return await this.productService.create(createProductDto);
}
```

With CreateProductDto:

```typescript
export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Laptop', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Product price', example: 999.99, minimum: 0, required: true })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Product description', example: 'High-performance laptop', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
```

---

### Example 3: Complex Endpoint with Multiple Parameters

```
Document the updateProductStatus endpoint in ProductController with Swagger decorators.

Endpoint details:
- Method: PATCH
- Path: /products/:id/status/:statusId
- Purpose: Update product status with additional metadata
- Authorization: Required, Admin role
- Path params: id (product ID), statusId (new status)
- Query params: reason (optional), updatedBy (optional)
- Request body: { notes?: string, metadata?: object }
- Response: { success: boolean, message: string, data: ProductDto }
```

**Expected Output:**

```typescript
@ApiOperation({
  summary: 'Update product status',
  description: 'Update product status with metadata. Demonstrates complex parameter handling. Requires Admin role.'
})
@ApiParam({ name: 'id', description: 'Product ID', example: 'product-123' })
@ApiParam({ name: 'statusId', description: 'New status ID', example: 'active' })
@ApiQuery({ name: 'reason', required: false, description: 'Reason for status change', example: 'Restocked' })
@ApiQuery({ name: 'updatedBy', required: false, description: 'User making the change', example: 'admin@example.com' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      notes: { type: 'string', example: 'Additional notes' },
      metadata: { type: 'object', example: { source: 'inventory-system' } }
    }
  }
})
@ApiResponse({
  status: 200,
  description: 'Status successfully updated',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Product status updated successfully' },
      data: { $ref: '#/components/schemas/ProductDto' }
    }
  }
})
@ApiResponse({ status: 404, description: 'Product not found' })
@ApiResponse({ status: 401, description: 'Not authenticated' })
@ApiBearerAuth('bearer')
@Authorize(Role.Admin)
@Patch(':id/status/:statusId')
async updateProductStatus(
  @Param('id') id: string,
  @Param('statusId') statusId: string,
  @Query('reason') reason?: string,
  @Query('updatedBy') updatedBy?: string,
  @Body() updateData?: { notes?: string; metadata?: Record<string, any> }
) {
  return await this.productService.updateStatus(id, statusId, { reason, updatedBy, ...updateData });
}
```

---

## Swagger Decorator Quick Reference

### Controller-Level Decorators

```typescript
@ApiTags('TagName')              // Group endpoints by tag
@ApiBearerAuth('bearer')         // All endpoints require authentication
```

### Endpoint-Level Decorators

```typescript
@ApiOperation({
  summary: 'Short description',           // Shows in Swagger UI list
  description: 'Detailed explanation'     // Shows in expanded view
})

@ApiResponse({
  status: 200,                            // HTTP status code
  description: 'Success message',         // What this status means
  type: ResponseDto                       // DTO class reference
})

@ApiParam({
  name: 'id',                             // Parameter name
  description: 'User ID',                 // What it represents
  example: 'user-123'                     // Example value
})

@ApiQuery({
  name: 'limit',                          // Query parameter name
  required: false,                        // Is it optional?
  description: 'Max items to return',     // What it does
  example: 10                             // Example value
})

@ApiBody({
  type: CreateDto                         // Reference to DTO class
  // OR
  schema: { type: 'object', ... }         // Inline schema definition
})
```

### DTO-Level Decorators

```typescript
@ApiProperty({
  description: 'Field description',       // What this field represents
  example: 'example-value',               // Example value
  required: true,                         // Is it required? (default: true)
  type: String,                           // TypeScript type
  enum: ['A', 'B'],                       // For enum fields
  minimum: 0,                             // For numbers
  maximum: 100,                           // For numbers
  minLength: 3,                           // For strings
  maxLength: 50                           // For strings
})
```

---

## Common Status Codes to Document

| Code | Description        | When to Use                         |
| ---- | ------------------ | ----------------------------------- |
| 200  | OK                 | Successful GET, PUT, PATCH          |
| 201  | Created            | Successful POST                     |
| 204  | No Content         | Successful DELETE                   |
| 400  | Bad Request        | Validation failed                   |
| 401  | Unauthorized       | Not authenticated                   |
| 403  | Forbidden          | Insufficient permissions            |
| 404  | Not Found          | Resource doesn't exist              |
| 409  | Conflict           | Duplicate or concurrency error      |
| 455  | Session Expired    | Custom: Session expired             |
| 456  | App Warning        | Custom: Application warning         |
| 457  | Concurrency Error  | Custom: Optimistic locking conflict |
| 458  | Unauthorized Login | Custom: Login failed                |
| 459  | App Error          | Custom: Critical error              |

---

## Testing Your Documentation

After documenting endpoints:

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Start the server:**

   ```bash
   npm run server
   ```

3. **Open Swagger UI:**

   ```
   http://localhost:3030/api/docs
   ```

4. **Verify:**
   - Endpoint appears in correct tag group
   - Summary and description are clear
   - All parameters show with examples
   - Request body schema is correct
   - Response examples are accurate
   - Authentication badge shows if required

5. **Test the endpoint:**
   - Click "Try it out"
   - Fill in example values
   - Click "Execute"
   - Verify response matches documentation

---

## Best Practices

1. **Be Consistent:** Follow patterns from existing controllers (User, Auth, Example)
2. **Be Specific:** Don't just say "Get data" - say "Retrieve list of users with optional pagination"
3. **Include Examples:** Every parameter and field should have realistic examples
4. **Document All Status Codes:** Include both success and error responses
5. **Update DTOs:** When documenting endpoints, ensure DTOs have @ApiProperty decorators
6. **Group by Tags:** Use clear, plural tag names (Users, Products, Orders)
7. **Security First:** Always document authentication requirements with @ApiBearerAuth
8. **Test Before Commit:** Always verify documentation in Swagger UI before committing

---

## Integration with Development Workflow

When adding a new endpoint following `prompts/add-api-endpoint.md`:

1. **Step 1-3:** Create DTOs, entity, controller, service (as usual)
2. **Step 4:** Use this prompt to document the endpoint
3. **Step 5:** Run `npm run gen-api-client` (generates Angular services)
4. **Step 6:** Build and test
5. **Step 7:** Verify in Swagger UI at `/api/docs`

---

## Reference Examples in Codebase

Study these fully-documented controllers:

- **Basic CRUD:** `apps/web-server/src/app/features/user/user.controller.ts`
- **Authentication:** `apps/web-server/src/app/auth/auth.controller.ts`
- **Complex Params:** `apps/web-server/src/app/features/example/example.controller.ts`
- **SSE/Streaming:** `apps/web-server/src/app/features/sync-events/sync-events.controller.ts`
- **Custom Errors:** `apps/web-server/src/app/features/exceptions/exceptions.controller.ts`
- **Simple Endpoint:** `apps/web-server/src/app/health/health.controller.ts`

Each demonstrates different Swagger documentation patterns.
