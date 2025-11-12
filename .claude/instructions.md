# General Project Rules

These rules apply to all code in this monorepo.

## Documentation Resources

**IMPORTANT:** Before starting any task, consult the relevant documentation:

- **`/prompts/`** - AI prompt templates for common tasks (CRUD, endpoints, UI, tests, etc.)
  - Read the relevant prompt BEFORE starting to ensure you follow all requirements
- **`/documents/`** - Technical reference docs (API reference, architecture, auth model, etc.)
  - Consult when you need to understand patterns or implementation details
- **`CLAUDE.md`** - Quick reference guide (always read first)
- **`.claude/instructions.md`** - This file (comprehensive rules and standards)

## Package Management

- **MUST** use `pnpm` when installing packages
- Never use npm or yarn

## Code Quality

- **MUST** use the project's ESLint configuration for linting
- **MUST** use the project's Prettier configuration for formatting
- **CRITICAL**: ALL files created or modified MUST pass `npm run format:check` and `npm run lint`

### Prettier Configuration (from .prettierrc)

When creating or modifying ANY file, ALWAYS apply these formatting rules:

- **printWidth**: 140 characters max per line
- **singleQuote**: Use single quotes (') not double quotes (")
- **tabWidth**: 2 spaces for indentation
- **useTabs**: false (use spaces, not tabs)
- **trailingComma**: 'all' (add trailing commas everywhere possible)
- **bracketSpacing**: true (spaces inside object literals: `{ foo: bar }`)
- **endOfLine**: 'auto'

### ESLint Rules

Key rules from eslint.config.js:

- `prettier/prettier`: 'error' - Prettier violations fail the build
- `@typescript-eslint/no-explicit-any`: 'warning' - Avoid `any` type
- `@typescript-eslint/no-empty-function`: 'error' - Use `jest.fn()` instead of `() => {}`
- `prefer-const`: Use `const` for variables that are never reassigned

### File Creation Checklist

Before considering any file complete:

1. ✅ Apply Prettier formatting (140 char width, single quotes, trailing commas)
2. ✅ Ensure no ESLint violations (especially prefer-const, no-empty-function)
3. ✅ Use proper indentation (2 spaces, no tabs)
4. ✅ Add trailing commas to all multi-line objects/arrays/functions
5. ✅ Use single quotes for strings

## Documentation

- **DO NOT** generate document files unless explicitly requested by the user
- Only create documentation when the user specifically asks for it

## Monorepo Structure

This is an Nx monorepo with the following structure:

- `/apps/web-ui` - Angular frontend application
- `/apps/web-server` - NestJS backend application
- `/packages/api-client` - HTTP client for API communication
- `/packages/backend-common` - Shared backend utilities and exceptions
- `/packages/data-access-layer` - TypeORM database access layer
- `/packages/types` - Shared types, DTOs, enums, and constants

## Cross-Package Dependencies

- Frontend (`web-ui`) uses `api-client` for HTTP communication
- Backend (`web-server`) uses `data-access-layer` for database access
- Both frontend and backend use `types` package for shared types
- Backend uses `backend-common` for shared utilities and error handling

## API Documentation (Swagger/OpenAPI)

**CRITICAL**: All API endpoints MUST include Swagger documentation decorators.

### Required Decorators for Controllers

When creating or modifying ANY controller endpoint, you MUST add:

1. **@ApiOperation** - Summary and description of the endpoint
2. **@ApiResponse** - For ALL status codes (200, 201, 400, 401, 403, 404, etc.)
3. **@ApiParam** - For path parameters (with examples)
4. **@ApiQuery** - For query parameters (with examples)
5. **@ApiBody** - For request bodies (inline schema or DTO reference)
6. **@ApiBearerAuth('bearer')** - If authentication is required
7. **@ApiTags** - At controller level for grouping

### DTOs and Swagger

**NEVER add @ApiProperty decorators to DTOs in packages/types**

- DTOs should only have class-validator decorators (@IsString, @IsEmail, @MinLength, etc.)
- Swagger decorators belong ONLY in controllers
- DTOs are shared with frontend and must remain framework-agnostic

### Example Reference

Follow the pattern in `apps/web-server/src/app/features/user/user.controller.ts`:

```typescript
@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
export class UserController {
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve list with pagination' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Success', type: [UserDto] })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.Admin)
  @Get()
  async findAll(@Query('limit') limit?: number) {}
}
```

### Verification

After implementing endpoints:

1. Run `npm run build`
2. Verify at http://localhost:3030/api/docs
3. Check all parameters, responses, and examples are correct

See `prompts/document-api-endpoint.md` for detailed examples and templates.

## Unit Testing

**CRITICAL**: All new functionality and API endpoints MUST include unit tests.

### Testing Requirements

When creating or modifying code, you MUST write tests for:

1. **Controllers** - Test all endpoints with different scenarios
   - Success cases
   - Error cases (400, 401, 403, 404, etc.)
   - Different input combinations
   - Authorization checks

2. **Services** - Test business logic
   - All public methods
   - Edge cases and error handling
   - Mock dependencies (DbServices, external services)

3. **Mappers** - Test entity ↔ DTO conversions
   - Both directions (entity to DTO, DTO to entity)
   - Null/undefined handling
   - Partial updates

4. **DbServices** - Test database operations
   - CRUD operations
   - Query methods
   - Error handling

### Testing Standards

- **Framework**: Jest
- **Coverage Target**: Aim for >80% coverage
- **File Naming**: `*.spec.ts` next to the file being tested
- **Test Structure**: Describe blocks for each method, it blocks for each scenario
- **Mocking**: Use `jest.fn()` for mocks, never empty arrow functions

### Example Reference

Follow the pattern in `apps/web-server/src/app/features/user/`:

- `user.controller.spec.ts` - Controller tests
- `user.service.spec.ts` - Service tests
- `user.mapper.spec.ts` - Mapper tests

### Test Template

```typescript
describe('FeatureController', () => {
  let controller: FeatureController;
  let service: FeatureService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [FeatureController],
      providers: [
        {
          provide: FeatureService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            // ... other methods
          },
        },
      ],
    }).compile();

    controller = module.get<FeatureController>(FeatureController);
    service = module.get<FeatureService>(FeatureService);
  });

  describe('findAll', () => {
    it('should return array of items', async () => {
      const result = [
        /* mock data */
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(new Error('DB error'));

      await expect(controller.findAll()).rejects.toThrow('DB error');
    });
  });
});
```

### Running Tests

- `npm run test` - Run all tests
- `npx nx test web-server` - Test backend only
- `npx nx test web-ui` - Test frontend only
- `npx nx test web-server --testPathPattern=user` - Test specific file

### Before Committing

1. ✅ Write unit tests for all new code
2. ✅ Run `npm run test` to ensure all tests pass
3. ✅ Verify coverage is reasonable (>80% for new code)
4. ✅ Fix any failing tests before committing
