# Entity-to-DTO Mapping Best Practices

This document outlines the best practices for mapping between TypeORM entities and DTOs in the Tokarev application.

## Approach

We've implemented a standardized approach for entity-to-DTO mapping using:

1. **BaseMapper**: A generic base class that provides common mapping functionality
2. **Entity-specific mappers**: Classes that extend BaseMapper for each entity type
3. **class-transformer**: Used for automatic object transformation

## Implementation Details

### BaseMapper

The `BaseMapper` class provides generic mapping functionality:

- `toDto()`: Maps an entity to a DTO
- `toDtos()`: Maps multiple entities to DTOs
- `toEntity()`: Maps a DTO to an entity
- `toUpdateEntity()`: Maps a DTO to an entity for update operations (abstract method to be implemented by derived classes)

### Entity-specific Mappers

Each entity has its own mapper class that extends `BaseMapper`:

```typescript
@Injectable()
export class CategoryMapper extends BaseMapper<Category, CategoryDto> {
  constructor() {
    super(Category, CategoryDto);
  }

  toUpdateEntity(dto: CategoryDto): Partial<Category> {
    // Implementation specific to Category entity
  }
}
```

### Usage in Services

Services inject the appropriate mapper:

```typescript
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    private categoryMapper: CategoryMapper,
  ) {}

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.categoryRepo.find();
    return this.categoryMapper.toDtos(categories);
  }
}
```

## Benefits

1. **Separation of concerns**: Mapping logic is separated from business logic
2. **Type safety**: Strong typing throughout the mapping process
3. **Code reuse**: Common mapping functionality in the base class
4. **Consistency**: Standardized approach across the application
5. **Maintainability**: Easy to update mapping logic in one place

## Best Practices

1. Always use mappers for entity-to-DTO conversion
2. Implement proper validation in DTOs using class-validator
3. Use ParseIntPipe and ValidationPipe in controllers
4. Handle errors appropriately (e.g., NotFoundException)
5. Keep entity and DTO structures aligned with the database schema
