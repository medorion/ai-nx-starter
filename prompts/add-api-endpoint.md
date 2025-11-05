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
4. Add JSDoc comments
5. Follow the pattern in apps/web-server/src/app/features/example/example.controller.ts
6. After completion, run: npm run gen-api-client

Validation:
- Use class-validator decorators for body DTOs
- Use @Query(), @Param(), @Body() decorators appropriately
- Add @Authorize() decorator with appropriate roles

After implementation:
- Run: npm run build
- Test the endpoint manually or write a test
- Verify the API client was generated correctly in packages/api-client/
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
