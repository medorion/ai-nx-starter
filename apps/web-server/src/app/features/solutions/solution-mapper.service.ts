import { Injectable } from '@nestjs/common';
import { SolutionDto } from '@medorion/types';
import { Solution } from '@medorion/data-access-layer';

@Injectable()
export class SolutionMapperService {
  /**
   * Maps a Solution entity to SolutionDto
   */
  toDto(solution: Solution): SolutionDto {
    return {
      id: solution.id,
      orgCode: solution.orgCode,
      appCode: solution.appCode,
      name: solution.name,
      description: solution.description,
      isActive: solution.isActive,
      allowedUserIds: solution.allowedUserIds,
      creationUserId: solution.creationUserId,
      defaultCommunicationSettings: solution.defaultCommunicationSettings as any,
    };
  }

  /**
   * Maps multiple Solution entities to SolutionDto array
   */
  toDtoArray(solutions: Solution[]): SolutionDto[] {
    return solutions.map((solution) => this.toDto(solution));
  }

  /**
   * Maps a SolutionDto to Solution entity (for creation)
   * Note: Does not set the id field as it's auto-generated
   */
  toEntity(dto: SolutionDto): Omit<Solution, '_id' | 'id' | 'createdAt' | 'updatedAt'> {
    return {
      orgCode: dto.orgCode,
      appCode: dto.appCode,
      name: dto.name,
      description: dto.description,
      isActive: dto.isActive,
      allowedUserIds: dto.allowedUserIds,
      creationUserId: dto.creationUserId,
      defaultCommunicationSettings: dto.defaultCommunicationSettings,
    };
  }

  /**
   * Creates a partial entity for update operations
   */
  toPartialEntity(dto: Partial<SolutionDto>): Partial<Solution> {
    const partial: Partial<Solution> = {};

    if (dto.orgCode !== undefined) partial.orgCode = dto.orgCode;
    if (dto.appCode !== undefined) partial.appCode = dto.appCode;
    if (dto.name !== undefined) partial.name = dto.name;
    if (dto.description !== undefined) partial.description = dto.description;
    if (dto.isActive !== undefined) partial.isActive = dto.isActive;
    if (dto.allowedUserIds !== undefined) partial.allowedUserIds = dto.allowedUserIds;
    if (dto.defaultCommunicationSettings !== undefined) {
      partial.defaultCommunicationSettings = dto.defaultCommunicationSettings;
    }

    return partial;
  }
}
