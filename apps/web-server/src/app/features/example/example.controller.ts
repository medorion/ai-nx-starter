import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Session, HttpCode, HttpStatus } from '@nestjs/common';
import { ExampleDto } from '@ai-nx-starter/types';
import { ExampleService } from './example.service';
import { Authorize } from '@ai-nx-starter/backend-common';
import { Role } from '@ai-nx-starter/types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

/**
 * Used by List/Item example
 */
@ApiTags('Examples')
@ApiBearerAuth('bearer')
@Controller(`examples/examples`)
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @ApiOperation({ summary: 'Get all examples', description: 'Retrieve all examples or filter by name. Requires Admin role.' })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by example name', example: 'Sample Example' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved examples', type: [ExampleDto] })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions (requires Admin)' })
  @Authorize(Role.Admin)
  @Get()
  findAll(@Query('name') name?: string): ExampleDto[] {
    if (name) {
      return this.exampleService.findByName(name);
    }
    return this.exampleService.findAll();
  }

  @ApiOperation({ summary: 'Get example count', description: 'Get total number of examples in the system' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved count',
    schema: { type: 'object', properties: { count: { type: 'number', example: 15 } } },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.Admin)
  @Get('count')
  getCount(): { count: number } {
    return { count: this.exampleService.count() };
  }

  @ApiOperation({ summary: 'Get example by ID', description: 'Find a specific example by its ID' })
  @ApiParam({ name: 'id', description: 'Example ID', example: 'example-123' })
  @ApiResponse({ status: 200, description: 'Successfully found example', type: ExampleDto })
  @ApiResponse({ status: 404, description: 'Example not found' })
  @Authorize(Role.Admin)
  @Get(':id')
  findOne(@Param('id') id: string): ExampleDto {
    return this.exampleService.findOne(id);
  }

  @ApiOperation({ summary: 'Create example', description: 'Create a new example. All fields except id are required.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'New Example', minLength: 3, maxLength: 50 },
        age: { type: 'number', example: 30, minimum: 1, maximum: 120 },
        email: { type: 'string', example: 'new@example.com' },
        tags: { type: 'array', items: { type: 'string' }, example: ['demo', 'test'] },
      },
      required: ['name', 'age', 'tags'],
    },
  })
  @ApiResponse({ status: 201, description: 'Example successfully created', type: ExampleDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Authorize(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExampleDto: Omit<ExampleDto, 'id'>): ExampleDto {
    return this.exampleService.create(createExampleDto);
  }

  @ApiOperation({ summary: 'Update example', description: 'Update an existing example. All fields are optional.' })
  @ApiParam({ name: 'id', description: 'Example ID to update', example: 'example-123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Example' },
        age: { type: 'number', example: 35 },
        email: { type: 'string', example: 'updated@example.com' },
        tags: { type: 'array', items: { type: 'string' }, example: ['updated'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Example successfully updated', type: ExampleDto })
  @ApiResponse({ status: 404, description: 'Example not found' })
  @Authorize(Role.Admin)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateExampleDto: Partial<ExampleDto>): ExampleDto {
    return this.exampleService.update(id, updateExampleDto);
  }

  @ApiOperation({
    summary: 'Advanced example update',
    description:
      'Complex update with multiple parameters - demonstrates path params, query params, body, and session handling. Requires Admin role.',
  })
  @ApiParam({ name: 'id', description: 'Example ID', example: 'example-123' })
  @ApiParam({ name: 'statusId', description: 'New status ID', example: 'status-active' })
  @ApiQuery({ name: 'priority', required: false, description: 'Priority level', example: 'high' })
  @ApiQuery({ name: 'category', required: false, description: 'Category', example: 'important' })
  @ApiQuery({ name: 'assignee', required: false, description: 'Assigned user', example: 'user-456' })
  @ApiQuery({ name: 'dueDate', required: false, description: 'Due date (ISO 8601)', example: '2025-12-31T23:59:59.000Z' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { notes: { type: 'string', example: 'Additional notes' }, metadata: { type: 'object', example: { key: 'value' } } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated example',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Advanced update completed for example example-123' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            statusId: { type: 'string' },
            priority: { type: 'string' },
            category: { type: 'string' },
            assignee: { type: 'string' },
            dueDate: { type: 'string' },
            sessionInfo: { type: 'object' },
            updateData: { type: 'object' },
            processedBy: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
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

  @ApiOperation({ summary: 'Delete example', description: 'Permanently delete an example from the system' })
  @ApiParam({ name: 'id', description: 'Example ID to delete', example: 'example-123' })
  @ApiResponse({ status: 204, description: 'Example successfully deleted' })
  @ApiResponse({ status: 404, description: 'Example not found' })
  @Authorize(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.exampleService.remove(id);
  }
}
