import { Injectable } from '@nestjs/common';
import { OrganizationDbService, Organization } from '@medorion/data-access-layer';
import { OrganizationDto, UpdateOrganizationDataDto, OrganizationStatus } from '@medorion/types';
import { AppErrorException } from '@medorion/backend-common';
import { OrganizationMapperService } from './organization-mapper.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationDbService: OrganizationDbService,
    private readonly mapper: OrganizationMapperService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OrganizationsService.name);
  }

  async findById(id: string): Promise<OrganizationDto | null> {
    const organization = await this.organizationDbService.findById(id);
    return organization ? this.mapper.toDto(organization) : null;
  }

  async findAll(limit = 50, offset = 0): Promise<OrganizationDto[]> {
    const organizations = await this.organizationDbService.findAll(limit, offset);
    return this.mapper.toDtoArray(organizations);
  }

  async findByStatus(status: OrganizationStatus): Promise<OrganizationDto[]> {
    const organizations = await this.organizationDbService.findByStatus(status);
    return this.mapper.toDtoArray(organizations);
  }

  async findByName(name: string): Promise<OrganizationDto | null> {
    const organization = await this.organizationDbService.findByName(name);
    return organization ? this.mapper.toDto(organization) : null;
  }

  async findByCode(code: string): Promise<OrganizationDto | null> {
    const organization = await this.organizationDbService.findByCode(code);
    return organization ? this.mapper.toDto(organization) : null;
  }

  async searchByName(namePattern: string): Promise<OrganizationDto[]> {
    const organizations = await this.organizationDbService.searchByName(namePattern);
    return this.mapper.toDtoArray(organizations);
  }

  async create(createData: OrganizationDto): Promise<OrganizationDto> {
    const organizationEntity: Organization = this.mapper.toEntity(createData);
    const existing = await this.organizationDbService.findByCode(createData.code);
    if (existing) {
      this.logger.error(`Organization with code ${createData.code} already exists`);
      throw new AppErrorException('Organization with code ' + createData.code + ' already exists');
    }
    const created = await this.organizationDbService.create(organizationEntity);
    this.logger.info(`Organization created: ${created.id}`);
    return this.mapper.toDto(created);
  }

  async update(id: string, updateData: UpdateOrganizationDataDto): Promise<OrganizationDto | null> {
    const updated = await this.organizationDbService.update(id, updateData);
    return updated ? this.mapper.toDto(updated) : null;
  }

  async updateStatus(id: string, status: OrganizationStatus): Promise<OrganizationDto | null> {
    const updated = await this.organizationDbService.updateStatus(id, status);
    return updated ? this.mapper.toDto(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.organizationDbService.delete(id);
  }

  async count(): Promise<number> {
    return this.organizationDbService.count();
  }

  async countByStatus(status: OrganizationStatus): Promise<number> {
    return this.organizationDbService.countByStatus(status);
  }

  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    return this.organizationDbService.isCodeUnique(code, excludeId);
  }

  async isNameUnique(name: string, excludeId?: string): Promise<boolean> {
    return this.organizationDbService.isNameUnique(name, excludeId);
  }
}
