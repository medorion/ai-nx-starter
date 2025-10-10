import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoItemDbService, SubItem } from '@monorepo-kit/data-access-layer';
import { TodoItemDto, CreateTodoItemDto, UpdateTodoItemDto, SubItemDto } from '@monorepo-kit/types';
import { TodoItemMapper } from './todo-item.mapper';

@Injectable()
export class TodoItemService {
  constructor(
    private readonly todoItemDbService: TodoItemDbService,
    private readonly todoItemMapper: TodoItemMapper,
  ) {}

  /**
   * Get all todo items with optional pagination
   */
  async findAll(limit = 50, offset = 0): Promise<TodoItemDto[]> {
    const entities = await this.todoItemDbService.findAll(limit, offset);
    return this.todoItemMapper.toDtoArray(entities);
  }

  /**
   * Get todo item by ID
   */
  async findById(id: string): Promise<TodoItemDto> {
    const entity = await this.todoItemDbService.findById(id);
    if (!entity) {
      throw new NotFoundException(`TodoItem with ID ${id} not found`);
    }
    return this.todoItemMapper.toDto(entity);
  }

  /**
   * Get todo items by status
   */
  async findByStatus(status: 'pending' | 'in_progress' | 'completed' | 'archived'): Promise<TodoItemDto[]> {
    const entities = await this.todoItemDbService.findByStatus(status);
    return this.todoItemMapper.toDtoArray(entities);
  }

  /**
   * Get todo items by assignee
   */
  async findByAssignee(assignedTo: string): Promise<TodoItemDto[]> {
    const entities = await this.todoItemDbService.findByAssignee(assignedTo);
    return this.todoItemMapper.toDtoArray(entities);
  }

  /**
   * Get todo items by tags
   */
  async findByTags(tags: string[]): Promise<TodoItemDto[]> {
    const entities = await this.todoItemDbService.findByTags(tags);
    return this.todoItemMapper.toDtoArray(entities);
  }

  /**
   * Get overdue todo items
   */
  async findOverdueTodos(): Promise<TodoItemDto[]> {
    const entities = await this.todoItemDbService.findOverdueTodos();
    return this.todoItemMapper.toDtoArray(entities);
  }

  /**
   * Create new todo item
   */
  async create(createTodoItemDto: CreateTodoItemDto): Promise<TodoItemDto> {
    const createData = this.todoItemMapper.toCreateData(createTodoItemDto);
    const entity = await this.todoItemDbService.create(createData);
    return this.todoItemMapper.toDto(entity);
  }

  /**
   * Update existing todo item
   */
  async update(id: string, updateTodoItemDto: UpdateTodoItemDto): Promise<TodoItemDto> {
    const updateData = this.todoItemMapper.toUpdateData(updateTodoItemDto);
    const entity = await this.todoItemDbService.update(id, updateData);

    if (!entity) {
      throw new NotFoundException(`TodoItem with ID ${id} not found`);
    }

    return this.todoItemMapper.toDto(entity);
  }

  /**
   * Add sub item to existing todo item
   */
  async addSubItem(id: string, subItemDto: SubItemDto): Promise<TodoItemDto> {
    // Convert SubItemDto to SubItem entity format
    const subItem = this.mapSubItemDtoToEntity(subItemDto);
    const entity = await this.todoItemDbService.addSubItem(id, subItem);

    if (!entity) {
      throw new NotFoundException(`TodoItem with ID ${id} not found`);
    }

    return this.todoItemMapper.toDto(entity);
  }

  /**
   * Remove sub item from existing todo item
   */
  async removeSubItem(id: string, subItemIndex: number): Promise<TodoItemDto> {
    const entity = await this.todoItemDbService.removeSubItem(id, subItemIndex);

    if (!entity) {
      throw new NotFoundException(`TodoItem with ID ${id} not found or subItem index ${subItemIndex} invalid`);
    }

    return this.todoItemMapper.toDto(entity);
  }

  /**
   * Delete todo item
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.todoItemDbService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`TodoItem with ID ${id} not found`);
    }
  }

  /**
   * Get total count of todo items
   */
  async count(): Promise<number> {
    return await this.todoItemDbService.count();
  }

  /**
   * Get count by status
   */
  async countByStatus(status: 'pending' | 'in_progress' | 'completed' | 'archived'): Promise<number> {
    return await this.todoItemDbService.countByStatus(status);
  }

  /**
   * Helper method to map SubItemDto to SubItem entity
   */
  private mapSubItemDtoToEntity(dto: SubItemDto): SubItem {
    switch (dto.type) {
      case 'text':
        return {
          type: 'text',
          content: dto.content,
          metadata: dto.metadata,
        };
      case 'number':
        return {
          type: 'number',
          value: dto.value,
          unit: dto.unit,
          metadata: dto.metadata,
        };
      case 'checklist':
        return {
          type: 'checklist',
          items: dto.items.map((item) => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
          })),
          metadata: dto.metadata,
        };
      case 'link':
        return {
          type: 'link',
          url: dto.url,
          title: dto.title,
          metadata: dto.metadata,
        };
      case 'date':
        return {
          type: 'date',
          date: dto.date,
          timezone: dto.timezone,
          metadata: dto.metadata,
        };
      default:
        throw new Error(`Unknown SubItemDto type: ${(dto as any).type}`);
    }
  }
}
