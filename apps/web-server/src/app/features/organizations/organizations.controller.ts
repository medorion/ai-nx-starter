import { Controller, Get, Post, Put, Delete, Body, Param, Query, ValidationPipe } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationDto, UpdateOrganizationDataDto, OrganizationStatus } from '@medorion/types';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  async findAll(@Query('limit') limit?: number, @Query('offset') offset?: number): Promise<OrganizationDto[]> {
    return this.organizationsService.findAll(limit, offset);
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.organizationsService.count();
    return { count };
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: OrganizationStatus): Promise<OrganizationDto[]> {
    return this.organizationsService.findByStatus(status);
  }

  @Get('status/:status/count')
  async countByStatus(@Param('status') status: OrganizationStatus): Promise<{ count: number }> {
    const count = await this.organizationsService.countByStatus(status);
    return { count };
  }

  @Get('search')
  async searchByName(@Query('name') name: string): Promise<OrganizationDto[]> {
    return this.organizationsService.searchByName(name);
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<OrganizationDto | null> {
    return this.organizationsService.findByName(name);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string): Promise<OrganizationDto | null> {
    return this.organizationsService.findByCode(code);
  }

  @Get('validate/code/:code')
  async isCodeUnique(@Param('code') code: string, @Query('excludeId') excludeId?: string): Promise<{ isUnique: boolean }> {
    const isUnique = await this.organizationsService.isCodeUnique(code, excludeId);
    return { isUnique };
  }

  @Get('validate/name/:name')
  async isNameUnique(@Param('name') name: string, @Query('excludeId') excludeId?: string): Promise<{ isUnique: boolean }> {
    const isUnique = await this.organizationsService.isNameUnique(name, excludeId);
    return { isUnique };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<OrganizationDto | null> {
    return this.organizationsService.findById(id);
  }

  @Post()
  async create(@Body(ValidationPipe) createData: OrganizationDto): Promise<OrganizationDto> {
    return this.organizationsService.create(createData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateData: UpdateOrganizationDataDto): Promise<OrganizationDto | null> {
    return this.organizationsService.update(id, updateData);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: OrganizationStatus): Promise<OrganizationDto | null> {
    return this.organizationsService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.organizationsService.delete(id);
    return { deleted };
  }
}
