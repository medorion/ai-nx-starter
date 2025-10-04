import { Controller, Get, Post, Put, Delete, Body, Param, Query, ValidationPipe } from '@nestjs/common';
import { SyncServiceFlowService } from './sync-service-flow.service';
import { SyncServiceFlowDto, SyncServiceFlowSearchOptionsDto, QueryResultDto, IMdWorkflow } from '@medorion/types';

@Controller('sync-service-flow')
export class SyncServiceFlowController {
  constructor(private readonly syncServiceFlowService: SyncServiceFlowService) {}

  @Get()
  async findAll(
    @Query('includeFlowDefinition') includeFlowDefinition?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SyncServiceFlowDto[]> {
    return this.syncServiceFlowService.findAll(includeFlowDefinition ?? true, limit, offset);
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.syncServiceFlowService.count();
    return { count };
  }

  @Post('search')
  async search(@Body(ValidationPipe) options: SyncServiceFlowSearchOptionsDto): Promise<QueryResultDto<SyncServiceFlowDto>> {
    return this.syncServiceFlowService.search(options);
  }

  @Post('search/count')
  async searchCount(
    @Body(ValidationPipe) options: Omit<SyncServiceFlowSearchOptionsDto, 'includeFlowDefinition' | 'limit' | 'offset'>,
  ): Promise<{ count: number }> {
    const count = await this.syncServiceFlowService.count(options);
    return { count };
  }

  @Get('flow-id/:flowId')
  async findByFlowId(
    @Param('flowId') flowId: string,
    @Query('includeFlowDefinition') includeFlowDefinition?: boolean,
  ): Promise<SyncServiceFlowDto | null> {
    return this.syncServiceFlowService.findByFlowId(flowId, includeFlowDefinition ?? true);
  }

  @Get('message-id/:messageId')
  async findByMessageId(
    @Param('messageId') messageId: string,
    @Query('includeFlowDefinition') includeFlowDefinition?: boolean,
  ): Promise<SyncServiceFlowDto[]> {
    return this.syncServiceFlowService.findByMessageId(messageId, includeFlowDefinition ?? true);
  }

  @Get('org-code/:orgCode')
  async findByOrgCode(
    @Param('orgCode') orgCode: string,
    @Query('includeFlowDefinition') includeFlowDefinition?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SyncServiceFlowDto[]> {
    return this.syncServiceFlowService.findByOrgCode(orgCode, includeFlowDefinition ?? true, limit, offset);
  }

  @Get('org-code/:orgCode/count')
  async countByOrgCode(@Param('orgCode') orgCode: string): Promise<{ count: number }> {
    const count = await this.syncServiceFlowService.countByOrgCode(orgCode);
    return { count };
  }

  @Get('status/:status')
  async findByStatus(
    @Param('status') status: string,
    @Query('includeFlowDefinition') includeFlowDefinition?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SyncServiceFlowDto[]> {
    return this.syncServiceFlowService.findByStatus(status, includeFlowDefinition ?? true, limit, offset);
  }

  @Get('status/:status/count')
  async countByStatus(@Param('status') status: string): Promise<{ count: number }> {
    const count = await this.syncServiceFlowService.countByStatus(status);
    return { count };
  }

  @Get('created-at')
  async findByCreatedAt(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('includeFlowDefinition') includeFlowDefinition?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SyncServiceFlowDto[]> {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return this.syncServiceFlowService.findByCreatedAt(fromDate, toDate, includeFlowDefinition ?? true, limit, offset);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('includeFlowDefinition') includeFlowDefinition?: boolean,
  ): Promise<SyncServiceFlowDto | null> {
    return this.syncServiceFlowService.findById(id, includeFlowDefinition ?? true);
  }

  @Get(':id/with-workflow')
  async findByIdWithParsedWorkflow(@Param('id') id: string): Promise<{ flow: SyncServiceFlowDto | null; workflow: IMdWorkflow | null }> {
    const flow = await this.syncServiceFlowService.findById(id);
    const workflow = await this.syncServiceFlowService.findByIdWithParsedWorkflow(id);
    return { flow, workflow };
  }

  @Post()
  async create(@Body(ValidationPipe) createData: SyncServiceFlowDto): Promise<SyncServiceFlowDto> {
    return this.syncServiceFlowService.create(createData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateData: Partial<SyncServiceFlowDto>): Promise<SyncServiceFlowDto | null> {
    return this.syncServiceFlowService.update(id, updateData);
  }

  @Put('flow-id/:flowId')
  async updateByFlowId(
    @Param('flowId') flowId: string,
    @Body(ValidationPipe) updateData: Partial<SyncServiceFlowDto>,
  ): Promise<SyncServiceFlowDto | null> {
    return this.syncServiceFlowService.updateByFlowId(flowId, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.syncServiceFlowService.delete(id);
    return { deleted };
  }

  @Delete('flow-id/:flowId')
  async deleteByFlowId(@Param('flowId') flowId: string): Promise<{ deleted: boolean }> {
    const deleted = await this.syncServiceFlowService.deleteByFlowId(flowId);
    return { deleted };
  }
}
