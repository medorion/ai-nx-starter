import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { TodoItemDto, CreateTodoItemDto, UpdateTodoItemDto, SubItemDto } from '@monorepo-kit/types';
import { TodoItemService } from './todo-item.service';

@Controller('examples/todo-items')
export class TodoItemController {
  constructor(private readonly todoItemService: TodoItemService) {}

  /**
   * GET /todo-items
   * Get all todo items with optional pagination and filtering
   */
  @Get()
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('status') status?: 'pending' | 'in_progress' | 'completed' | 'archived',
    @Query('assignedTo') assignedTo?: string,
    @Query('tags', new ParseArrayPipe({ optional: true, separator: ',' })) tags?: string[],
  ): Promise<TodoItemDto[]> {
    // Handle filtering
    if (status) {
      return await this.todoItemService.findByStatus(status);
    }

    if (assignedTo) {
      return await this.todoItemService.findByAssignee(assignedTo);
    }

    if (tags && tags.length > 0) {
      return await this.todoItemService.findByTags(tags);
    }

    // Default: return all with pagination
    return await this.todoItemService.findAll(limit, offset);
  }

  /**
   * GET /todo-items/count
   * Get total count of todo items or count by status
   */
  @Get('count')
  async getCount(@Query('status') status?: 'pending' | 'in_progress' | 'completed' | 'archived'): Promise<{ count: number }> {
    const count = status ? await this.todoItemService.countByStatus(status) : await this.todoItemService.count();

    return { count };
  }

  /**
   * GET /todo-items/overdue
   * Get overdue todo items
   */
  @Get('overdue')
  async getOverdueTodos(): Promise<TodoItemDto[]> {
    return await this.todoItemService.findOverdueTodos();
  }

  /**
   * GET /todo-items/:id
   * Get todo item by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<TodoItemDto> {
    return await this.todoItemService.findById(id);
  }

  /**
   * POST /todo-items
   * Create new todo item
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createTodoItemDto: CreateTodoItemDto): Promise<TodoItemDto> {
    return await this.todoItemService.create(createTodoItemDto);
  }

  /**
   * PUT /todo-items/:id
   * Update existing todo item
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateTodoItemDto: UpdateTodoItemDto): Promise<TodoItemDto> {
    return await this.todoItemService.update(id, updateTodoItemDto);
  }

  /**
   * POST /todo-items/:id/sub-items
   * Add sub item to existing todo item
   */
  @Post(':id/sub-items')
  @HttpCode(HttpStatus.CREATED)
  async addSubItem(@Param('id') id: string, @Body(ValidationPipe) subItemDto: SubItemDto): Promise<TodoItemDto> {
    return await this.todoItemService.addSubItem(id, subItemDto);
  }

  /**
   * DELETE /todo-items/:id/sub-items/:index
   * Remove sub item from existing todo item
   */
  @Delete(':id/sub-items/:index')
  async removeSubItem(@Param('id') id: string, @Param('index', ParseIntPipe) subItemIndex: number): Promise<TodoItemDto> {
    return await this.todoItemService.removeSubItem(id, subItemIndex);
  }

  /**
   * PATCH /todo-items/:id/status/:status
   * Update todo item status
   */
  @Patch(':id/status/:status')
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: 'pending' | 'in_progress' | 'completed' | 'archived',
  ): Promise<TodoItemDto> {
    return await this.todoItemService.update(id, { status });
  }

  /**
   * PATCH /todo-items/:id/assignee
   * Update todo item assignee
   */
  @Patch(':id/assignee')
  async updateAssignee(@Param('id') id: string, @Body() body: { assignedTo: string }): Promise<TodoItemDto> {
    return await this.todoItemService.update(id, { assignedTo: body.assignedTo });
  }

  /**
   * PATCH /todo-items/:id/priority
   * Update todo item priority
   */
  @Patch(':id/priority')
  async updatePriority(@Param('id') id: string, @Body() body: { priority: number }): Promise<TodoItemDto> {
    return await this.todoItemService.update(id, { priority: body.priority });
  }

  /**
   * DELETE /todo-items/:id
   * Delete todo item
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.todoItemService.delete(id);
  }
}
