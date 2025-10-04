import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { SyncServiceFlow } from '../entities';
import { SyncServiceFlowSearchOptionsDto, QueryResultDto, IMdWorkflow } from '@medorion/types';

@Injectable()
export class SyncServiceFlowDbService {
  constructor(
    @InjectRepository(SyncServiceFlow)
    private syncServiceFlowRepository: MongoRepository<SyncServiceFlow>,
  ) {}

  async findById(id: string, includeFlowDefinition = true): Promise<SyncServiceFlow | null> {
    const objectId = new ObjectId(id);
    const findOptions: any = {
      where: { _id: objectId },
    };

    if (!includeFlowDefinition) {
      const result = await this.syncServiceFlowRepository.findOne(findOptions);
      if (result) {
        delete result.flowDefinition;
      }
      return result;
    }

    return await this.syncServiceFlowRepository.findOne(findOptions);
  }

  async findByFlowId(flowId: string, includeFlowDefinition = true): Promise<SyncServiceFlow | null> {
    const findOptions: any = {
      where: { flowId },
    };

    if (!includeFlowDefinition) {
      const result = await this.syncServiceFlowRepository.findOne(findOptions);
      if (result) {
        delete result.flowDefinition;
      }
      return result;
    }

    return await this.syncServiceFlowRepository.findOne(findOptions);
  }

  async findByMessageId(messageId: string, includeFlowDefinition = true): Promise<SyncServiceFlow[]> {
    const results = await this.syncServiceFlowRepository.find({
      where: { messageId },
      order: { createdAt: 'DESC' },
    });

    if (!includeFlowDefinition) {
      results.forEach((result) => delete result.flowDefinition);
    }

    return results;
  }

  async findByOrgCode(orgCode: string, includeFlowDefinition = true, limit = 50, offset = 0): Promise<SyncServiceFlow[]> {
    const results = await this.syncServiceFlowRepository.find({
      where: { orgCode },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    if (!includeFlowDefinition) {
      results.forEach((result) => delete result.flowDefinition);
    }

    return results;
  }

  async findByStatus(status: string, includeFlowDefinition = true, limit = 50, offset = 0): Promise<SyncServiceFlow[]> {
    const results = await this.syncServiceFlowRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    if (!includeFlowDefinition) {
      results.forEach((result) => delete result.flowDefinition);
    }

    return results;
  }

  async findByCreatedAt(from: Date, to: Date, includeFlowDefinition = true, limit = 50, offset = 0): Promise<SyncServiceFlow[]> {
    const results = await this.syncServiceFlowRepository.find({
      where: {
        createdAt: { $gte: from, $lte: to },
      },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    if (!includeFlowDefinition) {
      results.forEach((result) => delete result.flowDefinition);
    }

    return results;
  }

  async search(options: SyncServiceFlowSearchOptionsDto): Promise<QueryResultDto<SyncServiceFlow>> {
    const {
      flowId,
      messageId,
      orgCode,
      status,
      createdAtFrom,
      createdAtTo,
      includeFlowDefinition = true,
      limit = 50,
      offset = 0,
    } = options;

    const where: any = {};

    if (flowId) {
      where.flowId = flowId;
    }

    if (messageId) {
      where.messageId = messageId;
    }

    if (orgCode) {
      where.orgCode = orgCode;
    }

    if (status) {
      where.status = status;
    }

    if (createdAtFrom || createdAtTo) {
      where.createdAt = {};
      if (createdAtFrom) {
        where.createdAt.$gte = createdAtFrom;
      }
      if (createdAtTo) {
        where.createdAt.$lte = createdAtTo;
      }
    }

    // Get total count
    const total = await this.syncServiceFlowRepository.count(where);

    // Get paginated results
    const results = await this.syncServiceFlowRepository.find({
      where,
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    if (!includeFlowDefinition) {
      results.forEach((result) => delete result.flowDefinition);
    }

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data: results,
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  }

  async findAll(includeFlowDefinition = true, limit = 50, offset = 0): Promise<SyncServiceFlow[]> {
    const results = await this.syncServiceFlowRepository.find({
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    if (!includeFlowDefinition) {
      results.forEach((result) => delete result.flowDefinition);
    }

    return results;
  }

  async create(flowData: Omit<SyncServiceFlow, '_id' | 'id' | 'createdAt'>): Promise<SyncServiceFlow> {
    const flow = this.syncServiceFlowRepository.create(flowData);
    return await this.syncServiceFlowRepository.save(flow);
  }

  async update(id: string, updateData: Partial<SyncServiceFlow>): Promise<SyncServiceFlow | null> {
    const objectId = new ObjectId(id);
    const updateResult = await this.syncServiceFlowRepository.update({ _id: objectId }, updateData);

    if ((updateResult.affected ?? 0) === 0) {
      return null;
    }

    return await this.syncServiceFlowRepository.findOne({ where: { _id: objectId } });
  }

  async updateByFlowId(flowId: string, updateData: Partial<SyncServiceFlow>): Promise<SyncServiceFlow | null> {
    const updateResult = await this.syncServiceFlowRepository.update({ flowId }, updateData);

    if ((updateResult.affected ?? 0) === 0) {
      return null;
    }

    return await this.syncServiceFlowRepository.findOne({ where: { flowId } });
  }

  async delete(id: string): Promise<boolean> {
    const objectId = new ObjectId(id);
    const result = await this.syncServiceFlowRepository.delete({ _id: objectId });
    return (result.affected ?? 0) > 0;
  }

  async deleteByFlowId(flowId: string): Promise<boolean> {
    const result = await this.syncServiceFlowRepository.delete({ flowId });
    return (result.affected ?? 0) > 0;
  }

  async count(options?: Omit<SyncServiceFlowSearchOptionsDto, 'includeFlowDefinition' | 'limit' | 'offset'>): Promise<number> {
    if (!options) {
      return await this.syncServiceFlowRepository.count();
    }

    const where: any = {};

    if (options.flowId) {
      where.flowId = options.flowId;
    }

    if (options.messageId) {
      where.messageId = options.messageId;
    }

    if (options.orgCode) {
      where.orgCode = options.orgCode;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.createdAtFrom || options.createdAtTo) {
      where.createdAt = {};
      if (options.createdAtFrom) {
        where.createdAt.$gte = options.createdAtFrom;
      }
      if (options.createdAtTo) {
        where.createdAt.$lte = options.createdAtTo;
      }
    }

    return await this.syncServiceFlowRepository.count({ where });
  }

  async countByStatus(status: string): Promise<number> {
    return await this.syncServiceFlowRepository.count({ where: { status } });
  }

  async countByOrgCode(orgCode: string): Promise<number> {
    return await this.syncServiceFlowRepository.count({ where: { orgCode } });
  }

  async findByIdWithParsedWorkflow(id: string): Promise<{ flow: SyncServiceFlow | null; workflow: IMdWorkflow | null }> {
    const flow = await this.findById(id, true);

    if (!flow) {
      return { flow: null, workflow: null };
    }

    let workflow: IMdWorkflow | null = null;

    if (flow.flowDefinition) {
      try {
        workflow = JSON.parse(flow.flowDefinition);
      } catch (error) {
        console.error('Failed to parse flow definition:', error);
      }
    }

    return { flow, workflow };
  }
}
