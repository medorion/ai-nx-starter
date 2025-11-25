# Create CRUD Feature Prompt

## Description

Generates a complete CRUD feature with backend API, database layer, and frontend UI.

## Prompt

```
Create a complete CRUD feature for [ENTITY_NAME] with the following specifications:

Entity Fields:
[LIST_FIELDS_HERE]
Example:
- id: string (auto-generated)
- name: string (required)
- email: string (required, unique)
- role: Role enum (Admin | User)
- createdAt: Date (auto-generated)

Requirements:
1. Create [Entity]Dto in packages/types/src/dto/[entity].dto.ts
2. Create [Entity] entity in packages/data-access-layer/src/features/[entity]/entities/[entity].entity.ts
3. Create [Entity]DbService in packages/data-access-layer/src/features/[entity]/services/[entity]-db.service.ts
4. Create [Entity]Controller in apps/web-server/src/app/features/[entity]/[entity].controller.ts
   - **REQUIRED:** Add Swagger decorators to ALL endpoints (@ApiOperation, @ApiResponse, @ApiParam, @ApiQuery, @ApiBody, @ApiBearerAuth)
   - Follow pattern in apps/web-server/src/app/features/user/user.controller.ts
5. Create [Entity]Service in apps/web-server/src/app/features/[entity]/[entity].service.ts
6. Create [Entity]Mapper in apps/web-server/src/app/features/[entity]/[entity].mapper.ts
7. **REQUIRED:** Write unit tests for controller, service, and mapper (*.spec.ts files)
   - Follow pattern in apps/web-server/src/app/features/user/
   - Test all CRUD operations and error cases
   - Mock dependencies with jest.fn()
8. Run: npm run test - Ensure all tests pass
9. Run: npx nx test web-server --coverage
   - Verify new feature files show good coverage (aim for 80%+)
   - Check terminal output for coverage summary
   - If coverage fails, write additional tests for uncovered code paths
   - See documents/code-coverage-guidelines.md for guidance on what to test vs. exclude
10. Run: npm run gen-api-client
11. Create UI components in apps/web-ui/src/app/features/backoffice/[entity]/
    - [entity]-list component (with table, pagination, search)
    - [entity]-form component (create/edit)
    - Follow detailed UI guidance in prompts/create-ui-component.md
    - Follow the pattern in apps/web-ui/src/app/features/backoffice/users/
12. Run: npm run build
    - **CRITICAL:** Fix any build errors before proceeding
    - Common issues: missing imports, incorrect component declarations, routing errors
13. **REQUIRED:** Write unit tests for UI components (*.spec.ts files)
    - Follow pattern in apps/web-ui/src/app/features/backoffice/users/components/
    - Test component initialization, form validation, API calls
    - Mock services with jest.fn()
14. Run: npx nx test web-ui --coverage
    - Verify UI components show good coverage
    - Check terminal output for coverage summary
15. Run: npm run format:fix
    - Ensure all files are properly formatted
16. Final verification:
    - Run: npm run build (verify entire project builds)
    - Run: npm run lint (verify no lint errors)
    - Manually test the UI at http://localhost:4200
    - Verify Swagger docs at http://localhost:3030/api/docs
17. (Optional) Write E2E tests in apps/web-ui-e2e/src/[entity].spec.ts
    - Test complete user workflows (create, read, update, delete)
    - Follow pattern in apps/web-ui-e2e/src/auth.spec.ts
    - Use Playwright test helpers from apps/web-ui-e2e/src/support/helpers.ts
    - Run: npm run e2e
    - Recommended for: Critical user flows, complex features, multi-step workflows
    - Can skip for: Simple CRUD features already covered by unit tests

Architecture Rules:
- Use @ai-nx-starter/types for DTOs (class-validator ONLY, NO @ApiProperty)
- Never use TypeORM directly in web-server (only in data-access-layer)
- Swagger decorators ONLY in controllers, never in DTOs
- Use NG-ZORRO components in UI
- Follow kebab-case naming for files
- Use PascalCase for classes
- Fix errors immediately when they occur - don't skip steps
```

## Placeholders

- `[ENTITY_NAME]`: Name of your entity (e.g., "Product", "Order", "Customer")
- `[LIST_FIELDS_HERE]`: Define entity fields with types and constraints
- `[entity]`: lowercase/kebab-case version (e.g., "product", "order")

## Expected Outcome

- Fully functional CRUD API endpoints
- Type-safe Angular service auto-generated
- Database entity with TypeORM
- UI with list view and form
- All integrated and working

## Example Usage

```
  Read CLAUDE.md for project rules.

  Create a Team management feature with the following specifications:

  Entity Fields:
  - id: string (auto-generated UUID)
  - name: string (required, 3-100 chars, unique)
  - description: string (optional, max 500 chars)
  - ownerId: string (required, reference to User)
  - memberIds: string[] (array of User IDs)
  - createdAt: Date (auto-generated)
  - updatedAt: Date (auto-updated)

  Requirements:
  1. Create TeamDto, CreateTeamDto, UpdateTeamDto in packages/types/src/dto/features/teams/
  2. Create Team entity in packages/data-access-layer/src/features/team/entities/team.entity.ts
  3. Create TeamDbService in packages/data-access-layer/src/features/team/services/team.db-service.ts
  4. Create TeamController in apps/web-server/src/app/features/team/team.controller.ts
     - **REQUIRED:** Add Swagger decorators to ALL endpoints (@ApiOperation, @ApiResponse, @ApiBearerAuth)
     - Include endpoints:
       * GET /teams - List all teams
       * GET /teams/:id - Get single team with populated owner and members
       * POST /teams - Create new team (creator becomes owner)
       * PUT /teams/:id - Update team details
       * DELETE /teams/:id - Delete team
       * POST /teams/:id/members - Add user to team
       * DELETE /teams/:id/members/:userId - Remove user from team
  5. Create TeamService in apps/web-server/src/app/features/team/team.service.ts
  6. Create TeamMapper in apps/web-server/src/app/features/team/team.mapper.ts
  7. **REQUIRED:** Write unit tests for controller, service, and mapper (*.spec.ts files)
  8. Run: npm run test - Ensure all tests pass
  9. Run: npx nx test web-server --coverage
  10. Run: npm run gen-api-client
  11. Create UI in apps/web-ui/src/app/features/backoffice/teams/
      - teams-list component (table showing teams with owner and member count)
      - team-form component (create/edit modal)
      - team-members component (manage team members with add/remove functionality)
  12. Run: npm run build - Fix any build errors
  13. **REQUIRED:** Write unit tests for UI components (*.spec.ts files)
  14. Run: npx nx test web-ui --coverage
  15. Run: npm run format:fix
  16. Final verification: build + lint + manual test
  17. (Optional) Write E2E tests for team workflows

  Follow the workflow in prompts/create-crud-feature.md
```
