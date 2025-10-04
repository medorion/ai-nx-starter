---
trigger: model_decision
description: Applies only to packages/data-access-layer
---

---

trigger: model_decision
description: Applies only to packages/data-access-layer

---

# Data Access Layer Package Rules

## Packages

- We use nestjs, typeorm , mongo

## Structure

- `/src/<feature>/entities` → entity definitions for the feature
- `/src/<feature>/services` → Unit of Work services for the feature
- `/src/<feature>/index.ts` → feature exports (entities and services)
- `/src/index.ts` → package exports (re-exports all features)

## Architecture

- Features are organized by business domain (e.g., todo-item, user, organization).
- Each feature has its own entities and services folders.
- Each class/interface must have its own file within the appropriate feature folder.

## Entities

- Defined only in `/src/<feature>/entities`
- Use TypeORM decorators
- File suffix: `.entity.ts`
- Must have TypeScript interfaces
- Each feature's entities folder has an `index.ts` that exports all entities

## Services

- Implemented only in `/src/<feature>/services`
- File/class naming: `<Entity>DbService`, `.db-service.ts`
- Must implement Unit of Work
- Only `DbService` classes exported
- Repositories used **only inside** `DbService`
- Updates must be partial
- We must have @Injectable() to expose service
- For update use Partial<Class>
- For create use whole entity
- When injecting repository use: @InjectRepository
  i.e constructor(@InjectRepository(TodoItem)
  private todoItemRepository: MongoRepository<TodoItem>) {}
- DO Not implement inline interfaces if needed for method parameters. Ddefine Dto's in types packages under dto/features/{feature}

## Database Access

- All operations via TypeORM
- We use mongo Db
- Repositories encapsulated in `DbService`
- No external repository access
- DO NOT Catch/Hanfle errors at data access layer
  -- For object Id use import { ObjectId } from 'mongodb';

## Exports

- Each feature exports through its own `index.ts`
- Only `DbService` classes and entity types exported publicly
- Repositories never exported
- Entities exported **only for typing**
- Main package `index.ts` re-exports all features
- No internal details exposed

## Naming

- Entity: `*.entity.ts`
- Service: `*.db-service.ts`
- Service class: `<Entity>DbService`
- Interfaces follow TypeScript conventions

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column() email: string;
}
```
