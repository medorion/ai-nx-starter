import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ClientUserDto } from '@monorepo-kit/types';
import { User } from '@monorepo-kit/data-access-layer';

@Injectable()
export class UserMapper {
  /**
   * Convert User entity to ClientUserDto
   */
  toDto(entity: User): ClientUserDto {
    return plainToClass(ClientUserDto, {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      role: entity.role,
      email: entity.email,
      phone: entity.phone,
      picture: entity.picture,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Convert array of User entities to ClientUserDto array
   */
  toDtoArray(entities: User[]): ClientUserDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
