import { Injectable } from '@nestjs/common';
import { SolutionDbService } from '@medorion/data-access-layer';
import { SolutionDto } from '@medorion/types';
import { AppErrorException } from '@medorion/backend-common';
import { SolutionMapperService } from './solution-mapper.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SolutionsService {
  constructor(
    private readonly solutionDbService: SolutionDbService,
    private readonly mapper: SolutionMapperService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(SolutionsService.name);
  }

  async findById(id: string): Promise<SolutionDto | null> {
    const solution = await this.solutionDbService.findById(id);
    return solution ? this.mapper.toDto(solution) : null;
  }

  async findAll(limit = 50, offset = 0): Promise<SolutionDto[]> {
    const solutions = await this.solutionDbService.findAll(limit, offset);
    return this.mapper.toDtoArray(solutions);
  }

  async findByOrgCode(orgCode: string): Promise<SolutionDto[]> {
    const solutions = await this.solutionDbService.findByOrgCode(orgCode);
    return this.mapper.toDtoArray(solutions);
  }

  async findActiveByOrgCode(orgCode: string): Promise<SolutionDto[]> {
    const solutions = await this.solutionDbService.findActiveByOrgCode(orgCode);
    return this.mapper.toDtoArray(solutions);
  }

  async findByAppCode(appCode: number): Promise<SolutionDto | null> {
    const solution = await this.solutionDbService.findByAppCode(appCode);
    return solution ? this.mapper.toDto(solution) : null;
  }

  async findByOrgCodeAndAppCode(orgCode: string, appCode: number): Promise<SolutionDto | null> {
    const solution = await this.solutionDbService.findByOrgCodeAndAppCode(orgCode, appCode);
    return solution ? this.mapper.toDto(solution) : null;
  }

  async findByUserId(userId: string): Promise<SolutionDto[]> {
    const solutions = await this.solutionDbService.findByUserId(userId);
    return this.mapper.toDtoArray(solutions);
  }

  async findActiveByUserId(userId: string): Promise<SolutionDto[]> {
    const solutions = await this.solutionDbService.findActiveByUserId(userId);
    return this.mapper.toDtoArray(solutions);
  }

  async create(createData: SolutionDto): Promise<SolutionDto> {
    // Check if solution with same app code already exists
    const existingByAppCode = await this.solutionDbService.findByAppCode(createData.appCode);
    if (existingByAppCode) {
      this.logger.error(`Solution with appCode ${createData.appCode} already exists`);
      throw new AppErrorException(`Solution with appCode ${createData.appCode} already exists`);
    }

    // Check if solution with same org code and app code exists
    const existing = await this.solutionDbService.findByOrgCodeAndAppCode(
      createData.orgCode,
      createData.appCode
    );
    if (existing) {
      this.logger.error(
        `Solution with orgCode ${createData.orgCode} and appCode ${createData.appCode} already exists`
      );
      throw new AppErrorException(
        `Solution with orgCode ${createData.orgCode} and appCode ${createData.appCode} already exists`
      );
    }

    const solutionEntity = this.mapper.toEntity(createData);
    const created = await this.solutionDbService.create(solutionEntity);
    this.logger.info(`Solution created: ${created.id}`);
    return this.mapper.toDto(created);
  }

  async update(id: string, updateData: Partial<SolutionDto>): Promise<SolutionDto | null> {
    const partialEntity = this.mapper.toPartialEntity(updateData);
    const updated = await this.solutionDbService.update(id, partialEntity);
    
    if (updated) {
      this.logger.info(`Solution updated: ${id}`);
    }
    
    return updated ? this.mapper.toDto(updated) : null;
  }

  async addAllowedUser(id: string, userId: string): Promise<SolutionDto | null> {
    const updated = await this.solutionDbService.addAllowedUser(id, userId);
    
    if (updated) {
      this.logger.info(`User ${userId} added to solution ${id}`);
    }
    
    return updated ? this.mapper.toDto(updated) : null;
  }

  async removeAllowedUser(id: string, userId: string): Promise<SolutionDto | null> {
    const updated = await this.solutionDbService.removeAllowedUser(id, userId);
    
    if (updated) {
      this.logger.info(`User ${userId} removed from solution ${id}`);
    }
    
    return updated ? this.mapper.toDto(updated) : null;
  }

  async setActiveStatus(id: string, isActive: boolean): Promise<SolutionDto | null> {
    const updated = await this.solutionDbService.setActiveStatus(id, isActive);
    
    if (updated) {
      this.logger.info(`Solution ${id} active status set to ${isActive}`);
    }
    
    return updated ? this.mapper.toDto(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.solutionDbService.delete(id);
    
    if (deleted) {
      this.logger.info(`Solution deleted: ${id}`);
    }
    
    return deleted;
  }

  async count(): Promise<number> {
    return this.solutionDbService.count();
  }

  async countByOrgCode(orgCode: string): Promise<number> {
    return this.solutionDbService.countByOrgCode(orgCode);
  }

  async countActive(): Promise<number> {
    return this.solutionDbService.countActive();
  }

  async existsByAppCode(appCode: number): Promise<boolean> {
    return this.solutionDbService.existsByAppCode(appCode);
  }

  async existsByOrgCodeAndAppCode(orgCode: string, appCode: number): Promise<boolean> {
    return this.solutionDbService.existsByOrgCodeAndAppCode(orgCode, appCode);
  }
}
