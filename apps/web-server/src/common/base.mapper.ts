import { ClassConstructor, plainToInstance } from 'class-transformer';

/**
 * Base mapper class that provides common mapping functionality
 * between entities and DTOs
 */
export abstract class BaseMapper<Entity, Dto> {
  /**
   * Constructor for the BaseMapper
   * @param entityType The entity class constructor
   * @param dtoType The DTO class constructor
   */
  constructor(
    protected readonly entityType: ClassConstructor<Entity>,
    protected readonly dtoType: ClassConstructor<Dto>,
  ) {}

  /**
   * Maps an entity to a DTO
   * @param entity The entity to map
   * @returns The mapped DTO
   */
  toDto(entity: Entity): Dto {
    return plainToInstance(this.dtoType, entity, {
      excludeExtraneousValues: false, // Changed to false to include all properties
    });
  }

  /**
   * Maps multiple entities to DTOs
   * @param entities The entities to map
   * @returns The mapped DTOs
   */
  toDtos(entities: Entity[]): Dto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  /**
   * Maps a DTO to an entity
   * @param dto The DTO to map
   * @returns The mapped entity
   */
  toEntity(dto: Dto): Partial<Entity> {
    return plainToInstance(this.entityType, dto, {
      excludeExtraneousValues: false, // Changed to false to include all properties
    }) as Partial<Entity>;
  }

  /**
   * Maps a DTO to an entity for update operations
   * This method should be overridden in derived classes to handle
   * specific update logic
   * @param dto The DTO containing update data
   * @returns Partial entity with only the properties to update
   */
  abstract toUpdateEntity(dto: Dto): Partial<Entity>;
}
