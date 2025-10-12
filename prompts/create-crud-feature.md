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
5. Create [Entity]Service in apps/web-server/src/app/features/[entity]/[entity].service.ts
6. Create [Entity]Mapper in apps/web-server/src/app/features/[entity]/[entity].mapper.ts
7. Run: npm run gen-api-client
8. Create UI components in apps/web-ui/src/app/features/backoffice/[entity]/
   - [entity]-list component (with table, pagination, search)
   - [entity]-form component (create/edit)
   Follow the pattern in apps/web-ui/src/app/features/backoffice/users/

Architecture Rules:
- Use @ai-nx-starter/types for DTOs
- Never use TypeORM directly in web-server (only in data-access-layer)
- Use class-validator decorators in DTOs
- Use NG-ZORRO components in UI
- Follow kebab-case naming for files
- Use PascalCase for classes

After EACH step:
- Run: npm run build
- Fix any errors before proceeding
- Confirm completion before moving to next step
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
Create a complete CRUD feature for Product with the following specifications:

Entity Fields:
- id: string (auto-generated UUID)
- name: string (required, min 3 chars)
- description: string (optional)
- price: number (required, min 0)
- category: string (required)
- inStock: boolean (default true)
- createdAt: Date (auto-generated)
- updatedAt: Date (auto-updated)

[... rest of the prompt ...]
```

## Time Estimate

With AI: 20-30 minutes
Without AI: 2-3 hours
