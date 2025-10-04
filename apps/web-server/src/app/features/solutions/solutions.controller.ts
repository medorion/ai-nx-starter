import { Controller, Get, Post, Put, Delete, Body, Param, Query, ValidationPipe } from '@nestjs/common';
import { SolutionsService } from './solutions.service';
import { SolutionDto } from '@medorion/types';

@Controller('solutions')
export class SolutionsController {
  constructor(private readonly solutionsService: SolutionsService) {}

  @Get()
  async findAll(@Query('limit') limit?: number, @Query('offset') offset?: number): Promise<SolutionDto[]> {
    return this.solutionsService.findAll(limit, offset);
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.solutionsService.count();
    return { count };
  }

  @Get('count/active')
  async countActive(): Promise<{ count: number }> {
    const count = await this.solutionsService.countActive();
    return { count };
  }

  @Get('org')
  async findByOrgCode(@Param('orgCode') orgCode: string): Promise<SolutionDto[]> {
    // orgCode is already in the base path
    return this.solutionsService.findByOrgCode(orgCode);
  }

  @Get('org/active')
  async findActiveByOrgCode(): Promise<SolutionDto[]> {
    // orgCode is already in the base path
    return this.solutionsService.findAll();
  }

  @Get('org/count')
  async countByOrgCode(): Promise<{ count: number }> {
    // orgCode is already in the base path
    const count = await this.solutionsService.count();
    return { count };
  }

  @Get('app-code/:appCode')
  async findByAppCode(@Param('appCode') appCode: number): Promise<SolutionDto | null> {
    return this.solutionsService.findByAppCode(appCode);
  }

  @Get('org/app-code/:appCode')
  async findByOrgCodeAndAppCode(@Param('appCode') appCode: number): Promise<SolutionDto | null> {
    // orgCode is already in the base path
    return this.solutionsService.findByAppCode(appCode);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<SolutionDto[]> {
    return this.solutionsService.findByUserId(userId);
  }

  @Get('user/:userId/active')
  async findActiveByUserId(@Param('userId') userId: string): Promise<SolutionDto[]> {
    return this.solutionsService.findActiveByUserId(userId);
  }

  @Get('validate/app-code/:appCode')
  async existsByAppCode(@Param('appCode') appCode: number): Promise<{ exists: boolean }> {
    const exists = await this.solutionsService.existsByAppCode(appCode);
    return { exists };
  }

  @Get('validate/org/app-code/:appCode')
  async existsByOrgCodeAndAppCode(@Param('appCode') appCode: number): Promise<{ exists: boolean }> {
    // orgCode is already in the base path
    const exists = await this.solutionsService.existsByAppCode(appCode);
    return { exists };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<SolutionDto | null> {
    return this.solutionsService.findById(id);
  }

  @Post()
  async create(@Body(ValidationPipe) createData: SolutionDto): Promise<SolutionDto> {
    return this.solutionsService.create(createData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateData: Partial<SolutionDto>): Promise<SolutionDto | null> {
    return this.solutionsService.update(id, updateData);
  }

  @Put(':id/status')
  async setActiveStatus(@Param('id') id: string, @Body('isActive') isActive: boolean): Promise<SolutionDto | null> {
    return this.solutionsService.setActiveStatus(id, isActive);
  }

  @Put(':id/users/:userId')
  async addAllowedUser(@Param('id') id: string, @Param('userId') userId: string): Promise<SolutionDto | null> {
    return this.solutionsService.addAllowedUser(id, userId);
  }

  @Delete(':id/users/:userId')
  async removeAllowedUser(@Param('id') id: string, @Param('userId') userId: string): Promise<SolutionDto | null> {
    return this.solutionsService.removeAllowedUser(id, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.solutionsService.delete(id);
    return { deleted };
  }
}
