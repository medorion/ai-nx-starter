# Testing Guide - Backend Testing Strategies

Complete guide to testing backend services with Jest and NestJS Testing utilities.

## Table of Contents

- [What to Test](#what-to-test)
- [Testing Services](#testing-services)
- [Testing Controllers](#testing-controllers)
- [Testing DbServices](#testing-dbservices)
- [Testing Mappers](#testing-mappers)
- [Coverage Targets](#coverage-targets)
- [Quick Reference](#quick-reference)

---

## What to Test

### Decision Matrix

| Code Type                        | Action                 | Reasoning                                           | Example                  |
| -------------------------------- | ---------------------- | --------------------------------------------------- | ------------------------ |
| **Business Logic Service**       | ✅ Write tests         | Critical functionality, high change rate            | `user.service.ts`        |
| **API Controller**               | ✅ Write tests         | Defines public contracts                            | `user.controller.ts`     |
| **Data Mapper**                  | ✅ Write tests         | Data transformation is error-prone                  | `user.mapper.ts`         |
| **Guards/Interceptors**          | ✅ Write tests         | Security-critical                                   | `authorize.guard.ts`     |
| **DbService**                    | ✅ Write tests         | Data access logic                                   | `user.db-service.ts`     |
| **Pure Utility Functions**       | ✅ Write tests         | Shared code, affects multiple features              | `validation-utils.ts`    |
| **SSE/WebSocket Infrastructure** | ❌ Exclude + E2E tests | Connection handling; test business logic separately | `sync-events.controller` |
| **Module Declarations**          | ❌ Already excluded    | Configuration only                                  | `*.module.ts`            |
| **Configuration Files**          | ❌ Already excluded    | Configuration data                                  | `app.config.ts`          |
| **main.ts / bootstrap**          | ❌ Already excluded    | Application bootstrap                               | `main.ts`                |

### Testing Policy

When creating new backend features:

- ✅ **Automatically write tests** for all business logic (Services, Controllers, DbServices, Mappers)
- ✅ Run `npm run test` to verify all pass
- ✅ Run `npm run test:coverage` to check completeness
- ❌ **Don't wait to be asked** - tests are part of the workflow

---

## Testing Services

### Test Structure

```typescript
// apps/web-server/src/app/features/user/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDbService } from '@ai-nx-starter/data-access-layer';
import { UserMapper } from './user.mapper';
import { PinoLogger } from 'nestjs-pino';

describe('UserService', () => {
  let service: UserService;
  let mockDbService: jest.Mocked<UserDbService>;
  let mockMapper: jest.Mocked<UserMapper>;

  beforeEach(async () => {
    mockDbService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockMapper = {
      toDto: jest.fn(),
      toDtoArray: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserDbService, useValue: mockDbService },
        { provide: UserMapper, useValue: mockMapper },
        { provide: PinoLogger, useValue: { setContext: jest.fn(), info: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findOne', () => {
    it('should return user DTO when found', async () => {
      const mockUser = { id: '123', email: 'test@test.com' };
      const mockDto = { id: '123', email: 'test@test.com' };
      mockDbService.findById.mockResolvedValue(mockUser as any);
      mockMapper.toDto.mockReturnValue(mockDto as any);

      const result = await service.findOne('123');

      expect(result).toEqual(mockDto);
      expect(mockDbService.findById).toHaveBeenCalledWith('123');
      expect(mockMapper.toDto).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDbService.findById.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### What to Test in Services

✅ **Test these**:

- Business logic and validation
- Error handling (NotFoundException, ConflictException, etc.)
- Calls to DbService with correct parameters
- Calls to Mapper with correct parameters
- Edge cases and boundary conditions

❌ **Don't test these**:

- Framework injection (NestJS handles this)
- Logger calls (unless critical to business logic)
- Exact error messages (test error types instead)

---

## Testing Controllers

### Test Structure

```typescript
// apps/web-server/src/app/features/user/user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, ClientUserDto } from '@ai-nx-starter/types';

describe('UserController', () => {
  let controller: UserController;
  let mockService: jest.Mocked<UserService>;

  beforeEach(async () => {
    mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('create', () => {
    it('should create user and return DTO', async () => {
      const createDto: CreateUserDto = { email: 'test@test.com', password: 'pass' };
      const mockResult: ClientUserDto = { id: '123', email: 'test@test.com' };
      mockService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockResult);
      expect(mockService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const mockResult: ClientUserDto = { id: '123', email: 'test@test.com' };
      mockService.findOne.mockResolvedValue(mockResult);

      const result = await controller.findOne('123');

      expect(result).toEqual(mockResult);
      expect(mockService.findOne).toHaveBeenCalledWith('123');
    });
  });
});
```

### What to Test in Controllers

✅ **Test these**:

- Calls to service methods with correct parameters
- Returns service results correctly
- Parameter extraction (@Param, @Body, @Query)

❌ **Don't test these**:

- Validation decorators (class-validator handles this)
- Authorization guards (test guards separately)
- Swagger decorators (documentation only)

---

## Testing DbServices

DbServices interact with TypeORM. Focus on query logic, not the framework.

### Test Structure

```typescript
// packages/data-access-layer/src/features/user/services/user.db-service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDbService } from './user.db-service';
import { User } from '../entities/user.entity';

describe('UserDbService', () => {
  let service: UserDbService;
  let mockRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDbService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserDbService>(UserDbService);
  });

  describe('findByEmail', () => {
    it('should find user by email (case insensitive)', async () => {
      const mockUser = { id: '123', email: 'test@test.com' };
      mockRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findByEmail('TEST@test.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });
});
```

### What to Test in DbServices

✅ **Test these**:

- Custom query logic (WHERE clauses, joins, filters)
- Data transformation before/after database operations
- Error handling (not found, duplicates, validation)
- Business rules applied at data layer

❌ **Don't test these**:

- TypeORM framework (`.save()`, `.find()` work correctly)
- Database connection setup (infrastructure)
- TypeORM decorators (framework responsibility)

### Key Points

1. **Mock the Repository**: Use `getRepositoryToken(Entity)` from `@nestjs/typeorm`
2. **Test query logic**: Focus on filters, transformations, custom queries
3. **Don't test TypeORM**: Trust the framework works
4. **Test business rules**: e.g., "findActiveUsers only returns active=true"

---

## Testing Mappers

### Test Structure

```typescript
// apps/web-server/src/app/features/user/user.mapper.spec.ts
import { UserMapper } from './user.mapper';
import { User } from '@ai-nx-starter/data-access-layer';
import { ClientUserDto } from '@ai-nx-starter/types';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  describe('toDto', () => {
    it('should map User entity to ClientUserDto', () => {
      const user: User = {
        id: '123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const result: ClientUserDto = mapper.toDto(user);

      expect(result.id).toBe('123');
      expect(result.email).toBe('test@test.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.password).toBeUndefined(); // Sensitive data excluded
    });

    it('should handle null/undefined fields', () => {
      const user: User = {
        id: '123',
        email: 'test@test.com',
        firstName: null,
        lastName: null,
      } as User;

      const result: ClientUserDto = mapper.toDto(user);

      expect(result.firstName).toBeUndefined();
      expect(result.lastName).toBeUndefined();
    });
  });

  describe('toDtoArray', () => {
    it('should map array of entities to DTOs', () => {
      const users: User[] = [{ id: '1', email: 'user1@test.com' } as User, { id: '2', email: 'user2@test.com' } as User];

      const result: ClientUserDto[] = mapper.toDtoArray(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });
});
```

### What to Test in Mappers

✅ **Test these**:

- Correct field mapping (entity → DTO)
- Sensitive data exclusion (passwords, tokens)
- Null/undefined handling
- Array transformations
- Nested object mapping

---

## Coverage Targets

### Recommended Thresholds

- **Statements**: 80%
- **Lines**: 80%
- **Branches**: 60%
- **Functions**: 60%

### Run Coverage

```bash
# Run tests with coverage
npm run test:coverage

# Run tests for specific project
npx nx test web-server --coverage
npx nx test data-access-layer --coverage
```

### Coverage Analysis

After running coverage, review the report:

1. **Identify untested files** - Look for 0% coverage
2. **Check if business logic** - Use decision matrix above
3. **Write tests or exclude** - Based on code type
4. **Re-run coverage** - Verify thresholds met

---

## Quick Reference

### Files to Check Before Testing

1. **Coverage exclusions**: [code-coverage-guide.md](code-coverage-guide.md)
2. **Backend Jest config**: `apps/web-server/jest.config.ts`
3. **Data access Jest config**: `packages/data-access-layer/jest.config.ts`
4. **Test setup**: `apps/web-server/src/test-setup.ts`
5. **Existing patterns**: Similar `*.spec.ts` files

### Common Mocks

```typescript
// Mock PinoLogger
const mockLogger = {
  setContext: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock DbService
const mockDbService = {
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock Mapper
const mockMapper = {
  toDto: jest.fn(),
  toDtoArray: jest.fn(),
};
```

### Test Naming Conventions

```typescript
describe('ClassName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
  });
});
```

---

**Related Files:**

- [SKILL.md](../SKILL.md) - Main backend guidelines
- [code-coverage-guide.md](code-coverage-guide.md) - Coverage exclusion guidelines
- [services-guide.md](services-guide.md) - Service patterns
- [controllers-guide.md](controllers-guide.md) - Controller patterns
- [database-patterns-guide.md](database-patterns-guide.md) - DbService patterns
