import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Session, HttpCode, HttpStatus } from '@nestjs/common';
import { ExampleDto } from '@ai-nx-starter/types';
import { ExampleService } from './example.service';
import { Authorize } from '@ai-nx-starter/backend-common';
import { Role } from '@ai-nx-starter/types';

/**
 * Used by List/Item example
 */
@Controller(`examples/examples`)
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  /**
   * GET /examples
   * Get all examples or filter by name
   */
  @Authorize(Role.Admin)
  @Get()
  findAll(@Query('name') name?: string): ExampleDto[] {
    if (name) {
      return this.exampleService.findByName(name);
    }
    return this.exampleService.findAll();
  }

  /**
   * GET /examples/count
   * Get total count of examples
   */
  @Authorize(Role.Admin)
  @Get('count')
  getCount(): { count: number } {
    return { count: this.exampleService.count() };
  }

  /**
   * GET /examples/:id
   * Get example by ID
   */
  @Authorize(Role.Admin)
  @Get(':id')
  findOne(@Param('id') id: string): ExampleDto {
    return this.exampleService.findOne(id);
  }

  /**
   * POST /examples
   * Create new example
   */
  @Authorize(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExampleDto: Omit<ExampleDto, 'id'>): ExampleDto {
    return this.exampleService.create(createExampleDto);
  }

  /**
   * PUT /examples/:id
   * Update existing example
   */
  @Authorize(Role.Admin)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateExampleDto: Partial<ExampleDto>): ExampleDto {
    return this.exampleService.update(id, updateExampleDto);
  }

  /**
   * PATCH /examples/:id/status/:statusId
   * Advanced update example with multiple parameters and session
   */
  @Authorize(Role.Admin)
  @Patch(':id/status/:statusId')
  @HttpCode(HttpStatus.OK)
  advancedUpdate(
    @Param('id') id: string,
    @Param('statusId') statusId: string,
    @Session() session: Record<string, any>,
    @Body() updateData: { notes?: string; metadata?: Record<string, any> },
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('assignee') assignee?: string,
    @Query('dueDate') dueDate?: string,
  ): {
    success: boolean;
    message: string;
    data: {
      id: string;
      statusId: string;
      priority: string;
      category: string;
      assignee: string;
      dueDate: string;
      sessionInfo: {
        sessionId: string;
        userId?: string;
        timestamp: string;
      };
      updateData: any;
      processedBy: string;
    };
  } {
    // Dummy processing logic
    return {
      success: true,
      message: `Advanced update completed for example ${id}`,
      data: {
        id,
        statusId,
        priority: priority || 'medium',
        category: category || 'general',
        assignee: assignee || 'unassigned',
        dueDate: dueDate || new Date().toISOString(),
        sessionInfo: {
          sessionId: session?.id || 'session_' + Date.now(),
          userId: session?.userId || 'anonymous',
          timestamp: new Date().toISOString(),
        },
        updateData,
        processedBy: 'Monorepo Kit System v2.0',
      },
    };
  }

  /**
   * DELETE /examples/:id
   * Delete example
   */
  @Authorize(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.exampleService.remove(id);
  }
}
