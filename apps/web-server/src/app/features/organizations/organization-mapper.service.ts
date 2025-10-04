import { Injectable } from '@nestjs/common';
import { OrganizationDto } from '@medorion/types';
import { Organization } from '@medorion/data-access-layer';

@Injectable()
export class OrganizationMapperService {
  /**
   * Maps an Organization entity to OrganizationDto
   */
  toDto(organization: Organization): OrganizationDto {
    return {
      id: organization.id,
      name: organization.name,
      code: organization.code,
      status: organization.status,
    };
  }

  /**
   * Maps multiple Organization entities to OrganizationDto array
   */
  toDtoArray(organizations: Organization[]): OrganizationDto[] {
    return organizations.map((org) => this.toDto(org));
  }

  /**
   * Maps an OrganizationDto to Organization entity
   * Note: Does not set the id field as it's typically auto-generated
   */
  toEntity(dto: OrganizationDto): Organization {
    const organization = new Organization();
    organization.name = dto.name;
    organization.code = dto.code;
    organization.status = dto.status;
    return organization;
  }

  /**
   * Updates an existing Organization entity with data from OrganizationDto
   * Useful for update operations where you want to preserve the entity instance
   */
  updateEntity(entity: Organization, dto: Partial<OrganizationDto>): Organization {
    if (dto.name !== undefined) {
      entity.name = dto.name;
    }
    if (dto.code !== undefined) {
      entity.code = dto.code;
    }
    if (dto.status !== undefined) {
      entity.status = dto.status;
    }
    return entity;
  }
}
