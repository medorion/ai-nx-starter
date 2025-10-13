# Data Access Layer Package Rules

**Context**: Database access layer package (`packages/data-access-layer`)

## Packages

- We use **NestJS**, **TypeORM**, and **MongoDB**

## Structure

- `/src/<feature>/entities` → entity definitions for the feature
- `/src/<feature>/services` → Unit of Work services for the feature
- `/src/<feature>/index.ts` → feature exports (entities and services)
- `/src/index.ts` → package exports (re-exports all features)

## Architecture

- Features are organized by business domain (e.g., `todo-item`, `user`, `organization`)
- Each feature has its own `entities` and `services` folders
- Each class/interface **MUST** have its own file within the appropriate feature folder

## Entities

- Defined **ONLY** in `/src/<feature>/entities`
- Use TypeORM decorators
- File suffix: `.entity.ts`
- **MUST** have TypeScript interfaces
- Each feature's entities folder has an `index.ts` that exports all entities

**Example:**

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column() email: string;
}
```

## Services

- Implemented **ONLY** in `/src/<feature>/services`
- File/class naming: `<Entity>DbService`, `.db-service.ts`
- **MUST** implement Unit of Work pattern
- **ONLY** `DbService` classes exported
- Repositories used **ONLY inside** `DbService`
- Updates **MUST** be partial
- **MUST** have `@Injectable()` decorator to expose service
- For update operations, use `Partial<Class>`
- For create operations, use whole entity
- When injecting repository, use `@InjectRepository`

**Example:**

```typescript
constructor(
  @InjectRepository(TodoItem)
  private todoItemRepository: MongoRepository<TodoItem>
) {}
```

- **DO NOT** implement inline interfaces for method parameters
- If needed, define DTOs in `types` package under `dto/features/{feature}`

## Database Access

- **ALL** operations via TypeORM
- We use **MongoDB**
- Repositories encapsulated in `DbService`
- **NO** external repository access
- **DO NOT** catch/handle errors at data access layer
- For ObjectId, use: `import { ObjectId } from 'mongodb';`

## Exports

- Each feature exports through its own `index.ts`
- **ONLY** `DbService` classes and entity types exported publicly
- Repositories **NEVER** exported
- Entities exported **ONLY for typing**
- Main package `index.ts` re-exports all features
- **NO** internal details exposed

## Naming

- Entity: `*.entity.ts`
- Service: `*.db-service.ts`
- Service class: `<Entity>DbService`
- Interfaces follow TypeScript conventions
