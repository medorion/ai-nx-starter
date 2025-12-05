# Database Patterns - DbService & TypeORM

Complete guide to database access patterns using DbService and TypeORM.

## Table of Contents

- [Package Overview](#package-overview)
- [Package Structure](#package-structure)
- [DbService Pattern](#dbservice-pattern)
- [Entity Definition](#entity-definition)
- [Standard DbService Methods](#standard-dbservice-methods)
- [Query Patterns](#query-patterns)
- [Error Handling](#error-handling)
- [Registration](#registration)

---

## Package Overview

### Technology Stack

**Package:** `packages/data-access-layer` (`@ai-nx-starter/data-access-layer`)

**Technologies:**

- **NestJS** - Dependency injection and modules
- **TypeORM** - ORM framework
- **MongoDB** - NoSQL database

### Responsibilities

**Data Access Layer is responsible for:**

- ✅ Entity definitions (database schema)
- ✅ Database operations via DbService
- ✅ TypeORM repository management
- ✅ Query construction and optimization

**Data Access Layer should NOT:**

- ❌ Contain business logic (belongs in app services)
- ❌ Know about DTOs (works with entities only)
- ❌ Handle HTTP concerns (belongs in controllers)
- ❌ Throw business exceptions (return null/entities)

---

## Package Structure

### Directory Organization

```
packages/data-access-layer/src/
├── features/                      # Feature-based organization
│   ├── user/                      # User feature
│   │   ├── entities/              # Entity definitions
│   │   │   ├── user.entity.ts
│   │   │   └── index.ts           # Export all entities
│   │   ├── services/              # DbService implementations
│   │   │   ├── user.db-service.ts
│   │   │   └── user.db-service.spec.ts
│   │   └── index.ts               # Export entities + services
│   │
│   ├── todo-item/                 # Todo Item feature
│   │   ├── entities/
│   │   │   ├── todo-item.entity.ts
│   │   │   ├── sub-item.type.ts   # Type definitions
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── todo-item.db-service.ts
│   │   │   └── todo-item.db-service.spec.ts
│   │   └── index.ts
│   │
│   └── [feature]/                 # Feature template
│       ├── entities/
│       │   ├── [entity].entity.ts
│       │   └── index.ts
│       ├── services/
│       │   ├── [entity].db-service.ts
│       │   └── [entity].db-service.spec.ts
│       └── index.ts
│
├── index.ts                       # Package exports (re-export features)
└── test-setup.ts                  # Jest configuration
```

### Organizational Rules

**Features:**

- ✅ Organized by business domain (e.g., `user`, `todo-item`, `organization`)
- ✅ Each feature has its own folder with `entities/` and `services/` subfolders
- ✅ Each feature exports through its own `index.ts`

**Files:**

- ✅ Each class/interface **MUST** have its own file
- ✅ Entity files: `*.entity.ts` suffix
- ✅ Service files: `*.db-service.ts` suffix
- ✅ Test files: `*.spec.ts` suffix

**Exports:**

- ✅ Each feature folder has `index.ts` exporting entities and services
- ✅ Main package `index.ts` re-exports all features
- ✅ **ONLY** DbService classes and entity types exported publicly
- ✅ Repositories **NEVER** exported
- ✅ Entities exported **ONLY for typing** (not for direct instantiation)

**Example feature `index.ts`:**

```typescript
// packages/data-access-layer/src/features/user/index.ts
export * from './entities';
export * from './services/user.db-service';
```

**Example package `index.ts`:**

```typescript
// packages/data-access-layer/src/index.ts
export * from './features/user';
export * from './features/todo-item';
// Add new feature exports here
```

---

## DbService Pattern

### Purpose

DbService is the **data access abstraction layer** between Services and TypeORM:

```
Service → DbService → TypeORM Repository → Database
```

**DbService is responsible for:**

- ✅ Encapsulating TypeORM repository operations
- ✅ Query construction and optimization
- ✅ Data transformation (hashing passwords, ObjectId conversion)
- ✅ Returning entities (not DTOs)

**DbService should NOT:**

- ❌ Contain business logic (that belongs in Service)
- ❌ Throw business exceptions (return null, let Service handle)
- ❌ Know about DTOs (works with entities only)
- ❌ Use inline interfaces for method parameters (define types in entities or DTOs package)

### DbService Template

**File:** `packages/data-access-layer/src/features/[entity]/services/[entity].db-service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { User } from '../entities/user.entity';

@Injectable()
export class UserDbService {
  constructor(
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    try {
      const objectId = new ObjectId(id);
      return await this.userRepository.findOneBy({ _id: objectId } as any);
    } catch {
      return null; // Invalid ObjectId format
    }
  }

  async findAll(limit = 50, offset = 0): Promise<User[]> {
    return await this.userRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async create(userData: Omit<User, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    try {
      const objectId = new ObjectId(id);
      const updateResult = await this.userRepository.update({ _id: objectId } as any, { ...updateData, updatedAt: new Date() });

      if ((updateResult.affected ?? 0) === 0) {
        return null;
      }

      return await this.userRepository.findOneBy({ _id: objectId } as any);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const deleteResult = await this.userRepository.delete({ _id: objectId } as any);
      return (deleteResult.affected ?? 0) > 0;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }
}
```

**Key Patterns:**

- ✅ `@Injectable()` decorator for NestJS DI
- ✅ `@InjectRepository()` for TypeORM repository injection
- ✅ Return `null` for not found (Service throws NotFoundException)
- ✅ Return `boolean` for delete operations
- ✅ Handle ObjectId conversion internally

---

## Entity Definition

### Entity Template

**File:** `packages/data-access-layer/src/features/[entity]/entities/[entity].entity.ts`

```typescript
import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false, select: false })
  password: string; // select: false excludes by default

  @Column({ nullable: true })
  phone?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property for string ID
  get id(): string {
    return this._id.toString();
  }
}
```

**Key Patterns:**

- ✅ `@ObjectIdColumn()` for MongoDB \_id field
- ✅ `@Column({ select: false })` for sensitive fields (password)
- ✅ `@CreateDateColumn()` / `@UpdateDateColumn()` for timestamps
- ✅ Getter for string ID conversion

### Entity Exports

**File:** `packages/data-access-layer/src/features/[entity]/entities/index.ts`

```typescript
export * from './user.entity';
```

**File:** `packages/data-access-layer/src/features/[entity]/index.ts`

```typescript
export * from './entities';
export * from './services/user.db-service';
```

---

## Standard DbService Methods

### CRUD Operations

| Method                     | Return Type      | Description                    |
| -------------------------- | ---------------- | ------------------------------ |
| `findById(id)`             | `Entity \| null` | Find by ID, null if not found  |
| `findAll(limit?, offset?)` | `Entity[]`       | Paginated list                 |
| `findBy[Field](value)`     | `Entity \| null` | Find by specific field         |
| `create(data)`             | `Entity`         | Create and return saved entity |
| `update(id, data)`         | `Entity \| null` | Update, return updated or null |
| `delete(id)`               | `boolean`        | Delete, return success status  |
| `count()`                  | `number`         | Total count                    |

### Custom Query Methods

Add domain-specific queries as needed:

```typescript
// Find by status with ordering
async findByStatus(status: 'pending' | 'completed'): Promise<TodoItem[]> {
  return await this.todoItemRepository.find({
    where: { status },
    order: { priority: 'DESC', createdAt: 'DESC' },
  });
}

// Find by array field (MongoDB)
async findByTags(tags: string[]): Promise<TodoItem[]> {
  return await this.todoItemRepository.find({
    where: { tags: { $in: tags } },
    order: { createdAt: 'DESC' },
  });
}

// Find with date comparison
async findOverdue(): Promise<TodoItem[]> {
  const now = new Date();
  return await this.todoItemRepository.find({
    where: {
      dueDate: { $lt: now },
      status: { $in: ['pending', 'in_progress'] },
    },
    order: { dueDate: 'ASC' },
  });
}

// Count by field
async countByStatus(status: string): Promise<number> {
  return await this.todoItemRepository.count({ where: { status } });
}
```

---

## Query Patterns

### Pagination

```typescript
async findAll(limit = 50, offset = 0): Promise<User[]> {
  return await this.userRepository.find({
    skip: offset,
    take: limit,
    order: { createdAt: 'DESC' },
  });
}
```

### Select Specific Fields

```typescript
// Include normally excluded fields (e.g., password for auth)
async findByEmailWithPassword(email: string): Promise<User | null> {
  return await this.userRepository.findOne({
    where: { email },
    select: ['_id', 'firstName', 'lastName', 'email', 'password', 'role'],
  });
}
```

### Ordering

```typescript
async findAll(): Promise<TodoItem[]> {
  return await this.todoItemRepository.find({
    order: {
      priority: 'DESC',   // Primary sort
      createdAt: 'DESC',  // Secondary sort
    },
  });
}
```

### MongoDB-Specific Queries

```typescript
// Array contains ($in)
where: { tags: { $in: ['urgent', 'important'] } }

// Less than ($lt)
where: { dueDate: { $lt: new Date() } }

// Greater than ($gt)
where: { priority: { $gt: 5 } }

// Multiple conditions
where: {
  status: { $in: ['pending', 'in_progress'] },
  dueDate: { $lt: new Date() },
}
```

---

## Error Handling

### DbService Returns null/false - Service Throws

```typescript
// ❌ WRONG - DbService throws exceptions
async findById(id: string): Promise<User> {
  const user = await this.userRepository.findOneBy({ _id: new ObjectId(id) });
  if (!user) {
    throw new NotFoundException('User not found'); // Don't do this in DbService!
  }
  return user;
}

// ✅ CORRECT - DbService returns null, Service decides
async findById(id: string): Promise<User | null> {
  try {
    const objectId = new ObjectId(id);
    return await this.userRepository.findOneBy({ _id: objectId } as any);
  } catch {
    return null; // Invalid ID format
  }
}
```

### Handle ObjectId Conversion

```typescript
async findById(id: string): Promise<User | null> {
  try {
    const objectId = new ObjectId(id);  // May throw if invalid format
    return await this.userRepository.findOneBy({ _id: objectId } as any);
  } catch {
    return null;  // Return null for invalid IDs
  }
}
```

### Data Transformation in DbService

```typescript
import * as bcrypt from 'bcrypt';

async create(userData: CreateUserData): Promise<User> {
  // Hash password before saving
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = this.userRepository.create({
    ...userData,
    password: hashedPassword,
  });

  return await this.userRepository.save(user);
}

async update(id: string, updateData: UpdateUserData): Promise<User | null> {
  const dataToUpdate = { ...updateData };

  // Hash password if being updated
  if (dataToUpdate.password) {
    dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
  }

  // ... update logic
}

// Password verification helper
async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
```

---

## Registration

### Register in data-access.module.ts

**File:** `apps/web-server/src/app/data-access.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserDbService } from '@ai-nx-starter/data-access-layer';
import { TodoItem, TodoItemDbService } from '@ai-nx-starter/data-access-layer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      TodoItem,
      // Add new entities here
    ]),
  ],
  providers: [
    UserDbService,
    TodoItemDbService,
    // Add new DbServices here
  ],
  exports: [
    UserDbService,
    TodoItemDbService,
    // Export DbServices for use in feature modules
  ],
})
export class DataAccessModule {}
```

### Export from Package

**File:** `packages/data-access-layer/src/index.ts`

```typescript
// Entities
export * from './features/user';
export * from './features/todo-item';

// Add new feature exports here
```

---

**Related Files:**

- [SKILL.md](../SKILL.md) - Main guide
- [types-guide.md](types-guide.md) - Types Package, DTOs, enums, constants, validation
- [services-guide.md](services-guide.md) - How Services use DbService
- [architecture-overview.md](architecture-overview.md) - Layered architecture
- [auth-session-guide.md](auth-session-guide.md) - Authentication and authorization
- [security-guide.md](security-guide.md) - Data access security, injection prevention
- [logging-guide.md](logging-guide.md) - Logging patterns
- [testing-guide.md](testing-guide.md) - AI testing guidelines
- [code-coverage-guide.md](code-coverage-guide.md) - Coverage exclusion guidelines
