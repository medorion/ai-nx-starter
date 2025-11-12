# Add API Endpoint Prompt

## Description

Adds a new endpoint to an existing controller with proper typing and documentation.

## Prompt

```
Add a new API endpoint to [ControllerName]:

Endpoint Specifications:
- Method: [GET|POST|PUT|PATCH|DELETE]
- Route: /[route-path]
- Path params: [list params or "none"]
- Query params: [list params or "none"]
- Body: [describe body or "none"]
- Response: [describe response type]

Example:
- Method: GET
- Route: /users/search
- Path params: none
- Query params: email (string, optional), role (string, optional), status (string, optional)
- Body: none
- Response: UserDto[]

Requirements:
1. Add the method to apps/web-server/src/app/features/[feature]/[feature].controller.ts
2. Implement logic in [Feature]Service if needed
3. Use appropriate HTTP status codes and decorators
4. **Add Swagger/OpenAPI documentation decorators** (@ApiOperation, @ApiResponse, @ApiParam, @ApiQuery, @ApiBody)
5. Follow the pattern in apps/web-server/src/app/features/user/user.controller.ts
6. After completion, run: npm run gen-api-client

Swagger Documentation (REQUIRED):
- Add @ApiOperation with summary and description
- Add @ApiResponse for all status codes (success and errors)
- Add @ApiParam for path parameters with examples
- Add @ApiQuery for query parameters with examples
- Add @ApiBody for request body (inline schema or DTO reference)
- Add @ApiBearerAuth('bearer') if authentication required
- Reference: prompts/document-api-endpoint.md for detailed examples

Validation:
- Use class-validator decorators for body DTOs (NOT @ApiProperty in DTOs)
- Use @Query(), @Param(), @Body() decorators appropriately
- Add @Authorize() decorator with appropriate roles

Unit Testing (REQUIRED):
- Write unit tests for the new endpoint in [feature].controller.spec.ts
- Test success cases and all error scenarios
- Mock service dependencies with jest.fn()
- Follow pattern in apps/web-server/src/app/features/user/user.controller.spec.ts
- Aim for >80% coverage

After implementation:
- Run: npm run test - Ensure all tests pass
- Run: npm run build
- Verify Swagger UI at http://localhost:3030/api/docs
- Verify the API client was generated correctly in packages/api-client/
- Manually test the endpoint
```

## Placeholders

- `[ControllerName]`: Existing controller name (e.g., "UserController", "ProductController")
- `[GET|POST|PUT|PATCH|DELETE]`: HTTP method
- `[route-path]`: API route
- `[feature]`: Feature name in kebab-case

## Expected Outcome

- New endpoint added to controller
- Service logic implemented
- Auto-generated Angular service method
- Type-safe and tested

## Example Usage

```
Add a new API endpoint to UserController:

Endpoint Specifications:
- Method: POST
- Route: /users/bulk-update
- Path params: none
- Query params: none
- Body: { userIds: string[], updates: Partial<UserDto> }
- Response: { updated: number, failed: number }

[... rest of the prompt ...]
```

## Time Estimate

With AI: 5-10 minutes
Without AI: 20-30 minutes
