import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ClientTeamDto, ClientUserDto } from '@ai-nx-starter/types';
import { Team, UserDbService } from '@ai-nx-starter/data-access-layer';
import { UserMapper } from '../user/user.mapper';

@Injectable()
export class TeamMapper {
  constructor(
    private readonly userDbService: UserDbService,
    private readonly userMapper: UserMapper,
  ) {}

  /**
   * Convert Team entity to ClientTeamDto without populating relationships
   */
  toDto(entity: Team): ClientTeamDto {
    return plainToClass(ClientTeamDto, {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      ownerId: entity.ownerId.toString(),
      memberIds: entity.memberIds.map((id) => id.toString()),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Convert Team entity to ClientTeamDto with populated owner and members
   */
  async toDtoWithRelations(entity: Team): Promise<ClientTeamDto> {
    const dto = this.toDto(entity);

    // Populate owner
    const owner = await this.userDbService.findById(entity.ownerId.toString());
    if (owner) {
      dto.owner = this.userMapper.toDto(owner);
    }

    // Populate members
    const members: ClientUserDto[] = [];
    for (const memberId of entity.memberIds) {
      const member = await this.userDbService.findById(memberId.toString());
      if (member) {
        members.push(this.userMapper.toDto(member));
      }
    }
    dto.members = members;

    return dto;
  }

  /**
   * Convert array of Team entities to ClientTeamDto array
   */
  toDtoArray(entities: Team[]): ClientTeamDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  /**
   * Convert array of Team entities to ClientTeamDto array with populated relationships
   */
  async toDtoArrayWithRelations(entities: Team[]): Promise<ClientTeamDto[]> {
    return await Promise.all(entities.map((entity) => this.toDtoWithRelations(entity)));
  }
}
