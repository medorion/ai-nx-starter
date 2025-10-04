# Solution Data Access Layer

This module provides the data access layer for managing Solutions in the Medorion platform.

## Structure

```
solution/
├── entities/
│   ├── solution.entity.ts      # TypeORM entity with embedded communication settings
│   └── index.ts
├── services/
│   ├── solution.db-service.ts  # CRUD operations and business queries
│   └── index.ts
└── index.ts
```

## Entity: Solution

The `Solution` entity represents an application/solution in the system with the following properties:

### Core Fields
- `_id` (ObjectId) - MongoDB ObjectId
- `id` (string) - String representation of _id (getter)
- `orgCode` (string, max 15) - Organization code
- `appCode` (number) - Unique application code
- `name` (string, max 50) - Solution name
- `description` (string, max 255) - Solution description
- `isActive` (boolean) - Active status (default: true)
- `allowedUserIds` (string[]) - Array of user IDs with access
- `creationUserId` (string) - User who created the solution
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

### Embedded Communication Settings
The entity includes a `defaultCommunicationSettings` field with nested settings:

- **GoogleAnalyticsSettings** - viewId
- **FacebookSettings** - adAccountId
- **EmailSettings** - accountName, accountKey, apiDomain, emailParameters
- **SmsSettings** - accountId, accountKey, accountFromService, shortenUrls
- **IvrSettings** - accountId, accountKey, fromNumber, enableMemberVerification, callAttempts, authenticationAttempts, timeout, authenticationFields
- **SlackSettings** - channelId
- **JourneySettings** - journeyRestartType, journeyRetentionDays
- **ExternalBucketSettings** - externalBucketCustomerService, externalBucketDecisionModelData

## Service: SolutionDbService

Injectable NestJS service providing comprehensive CRUD operations.

### Basic CRUD Operations

#### `findById(id: string): Promise<Solution | null>`
Find a solution by its MongoDB ObjectId.

#### `findAll(limit = 50, offset = 0): Promise<Solution[]>`
Get all solutions with pagination, ordered by creation date (DESC).

#### `create(solutionData: CreateSolutionData): Promise<Solution>`
Create a new solution.

#### `update(id: string, updateData: UpdateSolutionData): Promise<Solution | null>`
Update an existing solution.

#### `delete(id: string): Promise<boolean>`
Delete a solution by ID.

### Query Operations

#### `findByOrgCode(orgCode: string): Promise<Solution[]>`
Get all solutions for an organization.

#### `findActiveByOrgCode(orgCode: string): Promise<Solution[]>`
Get only active solutions for an organization.

#### `findByAppCode(appCode: number): Promise<Solution | null>`
Find a solution by its unique app code.

#### `findByOrgCodeAndAppCode(orgCode: string, appCode: number): Promise<Solution | null>`
Find a solution by organization and app code combination.

#### `findByUserId(userId: string): Promise<Solution[]>`
Get all solutions a user has access to.

#### `findActiveByUserId(userId: string): Promise<Solution[]>`
Get only active solutions a user has access to.

### User Access Management

#### `addAllowedUser(id: string, userId: string): Promise<Solution | null>`
Add a user to the solution's allowed users list.

#### `removeAllowedUser(id: string, userId: string): Promise<Solution | null>`
Remove a user from the solution's allowed users list.

### Status Management

#### `setActiveStatus(id: string, isActive: boolean): Promise<Solution | null>`
Toggle solution active/inactive status.

### Count & Existence Operations

#### `count(): Promise<number>`
Count total solutions.

#### `countByOrgCode(orgCode: string): Promise<number>`
Count solutions for an organization.

#### `countActive(): Promise<number>`
Count active solutions.

#### `existsByAppCode(appCode: number): Promise<boolean>`
Check if a solution exists with the given app code.

#### `existsByOrgCodeAndAppCode(orgCode: string, appCode: number): Promise<boolean>`
Check if a solution exists with the given org code and app code combination.

## Usage Example

```typescript
import { SolutionDbService, CreateSolutionData } from '@medorion/data-access-layer';

@Injectable()
export class SolutionService {
  constructor(private solutionDbService: SolutionDbService) {}

  async createSolution(data: CreateSolutionData) {
    return await this.solutionDbService.create(data);
  }

  async getOrgSolutions(orgCode: string) {
    return await this.solutionDbService.findActiveByOrgCode(orgCode);
  }

  async grantUserAccess(solutionId: string, userId: string) {
    return await this.solutionDbService.addAllowedUser(solutionId, userId);
  }
}
```

## Integration

The Solution entity and service are automatically registered in the `DataAccessModule`:

```typescript
import { Solution, SolutionDbService } from '@medorion/data-access-layer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Solution]),
  ],
  providers: [SolutionDbService],
  exports: [SolutionDbService],
})
export class DataAccessModule {}
```

## TypeORM Configuration

- **Database**: MongoDB
- **Collection**: `solutions`
- **Synchronize**: Enabled in development
- **Timestamps**: Automatic via `@CreateDateColumn` and `@UpdateDateColumn`
