import { Injectable } from '@nestjs/common';
import { SyncServiceFlowDbService } from '@medorion/data-access-layer';
import { SyncServiceFlowDto, SyncServiceFlowSearchOptionsDto, QueryResultDto, IMdWorkflow } from '@medorion/types';
import { SyncServiceFlowMapperService } from './sync-service-flow-mapper.service';
import { PinoLogger } from 'nestjs-pino';
import * as JSON5 from 'json5';

@Injectable()
export class SyncServiceFlowService {
  constructor(
    private readonly syncServiceFlowDbService: SyncServiceFlowDbService,
    private readonly mapper: SyncServiceFlowMapperService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SyncServiceFlowService.name);
  }

  async findById(id: string, includeFlowDefinition = true): Promise<SyncServiceFlowDto | null> {
    const flow = await this.syncServiceFlowDbService.findById(id, includeFlowDefinition);
    return flow ? this.mapper.toDto(flow) : null;
  }

  async findByFlowId(flowId: string, includeFlowDefinition = true): Promise<SyncServiceFlowDto | null> {
    const flow = await this.syncServiceFlowDbService.findByFlowId(flowId, includeFlowDefinition);
    return flow ? this.mapper.toDto(flow) : null;
  }

  async findByMessageId(messageId: string, includeFlowDefinition = true): Promise<SyncServiceFlowDto[]> {
    const flows = await this.syncServiceFlowDbService.findByMessageId(messageId, includeFlowDefinition);
    return this.mapper.toDtoArray(flows);
  }

  async findByOrgCode(orgCode: string, includeFlowDefinition = true, limit = 50, offset = 0): Promise<SyncServiceFlowDto[]> {
    const flows = await this.syncServiceFlowDbService.findByOrgCode(orgCode, includeFlowDefinition, limit, offset);
    return this.mapper.toDtoArray(flows);
  }

  async findByStatus(status: string, includeFlowDefinition = true, limit = 50, offset = 0): Promise<SyncServiceFlowDto[]> {
    const flows = await this.syncServiceFlowDbService.findByStatus(status, includeFlowDefinition, limit, offset);
    return this.mapper.toDtoArray(flows);
  }

  async findByCreatedAt(from: Date, to: Date, includeFlowDefinition = true, limit = 50, offset = 0): Promise<SyncServiceFlowDto[]> {
    const flows = await this.syncServiceFlowDbService.findByCreatedAt(from, to, includeFlowDefinition, limit, offset);
    return this.mapper.toDtoArray(flows);
  }

  async search(options: SyncServiceFlowSearchOptionsDto): Promise<QueryResultDto<SyncServiceFlowDto>> {
    const result = await this.syncServiceFlowDbService.search(options);
    return {
      data: this.mapper.toDtoArray(result.data),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }

  async findAll(includeFlowDefinition = true, limit = 50, offset = 0): Promise<SyncServiceFlowDto[]> {
    const flows = await this.syncServiceFlowDbService.findAll(includeFlowDefinition, limit, offset);
    return this.mapper.toDtoArray(flows);
  }

  async create(createData: SyncServiceFlowDto): Promise<SyncServiceFlowDto> {
    const flowEntity = this.mapper.toEntity(createData);
    const created = await this.syncServiceFlowDbService.create(flowEntity);
    this.logger.info(`Sync service flow created: ${created.id}`);
    return this.mapper.toDto(created);
  }

  async update(id: string, updateData: Partial<SyncServiceFlowDto>): Promise<SyncServiceFlowDto | null> {
    const updated = await this.syncServiceFlowDbService.update(id, updateData);
    if (updated) {
      this.logger.info(`Sync service flow updated: ${id}`);
    }
    return updated ? this.mapper.toDto(updated) : null;
  }

  async updateByFlowId(flowId: string, updateData: Partial<SyncServiceFlowDto>): Promise<SyncServiceFlowDto | null> {
    const updated = await this.syncServiceFlowDbService.updateByFlowId(flowId, updateData);
    if (updated) {
      this.logger.info(`Sync service flow updated by flowId: ${flowId}`);
    }
    return updated ? this.mapper.toDto(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.syncServiceFlowDbService.delete(id);
    if (deleted) {
      this.logger.info(`Sync service flow deleted: ${id}`);
    }
    return deleted;
  }

  async deleteByFlowId(flowId: string): Promise<boolean> {
    const deleted = await this.syncServiceFlowDbService.deleteByFlowId(flowId);
    if (deleted) {
      this.logger.info(`Sync service flow deleted by flowId: ${flowId}`);
    }
    return deleted;
  }

  async count(options?: Omit<SyncServiceFlowSearchOptionsDto, 'includeFlowDefinition' | 'limit' | 'offset'>): Promise<number> {
    return this.syncServiceFlowDbService.count(options);
  }

  async countByStatus(status: string): Promise<number> {
    return this.syncServiceFlowDbService.countByStatus(status);
  }

  async countByOrgCode(orgCode: string): Promise<number> {
    return this.syncServiceFlowDbService.countByOrgCode(orgCode);
  }

  async findByIdWithParsedWorkflow(id: string): Promise<IMdWorkflow | null> {
    const result = await this.syncServiceFlowDbService.findByIdWithParsedWorkflow(id);
    try {
      const workflow: IMdWorkflow | null = result.flow ? JSON5.parse(result.flow.flowDefinition) : null;
      return workflow;
    } catch (error) {
      this.logger.error(`Failed to parse workflow definition for flowId: ${result.flow?.flowId}`);
      return null;
    }
  }
}
