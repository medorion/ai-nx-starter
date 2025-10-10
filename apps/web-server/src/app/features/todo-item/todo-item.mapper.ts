import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  TodoItemDto,
  CreateTodoItemDto,
  UpdateTodoItemDto,
  SubItemDto,
  TextSubItemDto,
  NumberSubItemDto,
  ChecklistSubItemDto,
  LinkSubItemDto,
  DateSubItemDto,
} from '@monorepo-kit/types';
import { TodoItem, SubItem, CreateTodoItemData, UpdateTodoItemData } from '@monorepo-kit/data-access-layer';

@Injectable()
export class TodoItemMapper {
  /**
   * Convert TodoItem entity to TodoItemDto
   */
  toDto(entity: TodoItem): TodoItemDto {
    return plainToClass(TodoItemDto, {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      subItems: this.mapSubItemsToDto(entity.subItems),
      status: entity.status,
      priority: entity.priority,
      dueDate: entity.dueDate,
      assignedTo: entity.assignedTo,
      tags: entity.tags,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Convert array of TodoItem entities to TodoItemDto array
   */
  toDtoArray(entities: TodoItem[]): TodoItemDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  /**
   * Convert CreateTodoItemDto to CreateTodoItemData
   */
  toCreateData(dto: CreateTodoItemDto): CreateTodoItemData {
    return {
      title: dto.title,
      description: dto.description,
      subItems: dto.subItems ? this.mapSubItemsToEntity(dto.subItems) : [],
      status: dto.status,
      priority: dto.priority,
      dueDate: dto.dueDate,
      assignedTo: dto.assignedTo,
      tags: dto.tags,
    };
  }

  /**
   * Convert UpdateTodoItemDto to UpdateTodoItemData
   */
  toUpdateData(dto: UpdateTodoItemDto): UpdateTodoItemData {
    return {
      title: dto.title,
      description: dto.description,
      subItems: dto.subItems ? this.mapSubItemsToEntity(dto.subItems) : undefined,
      status: dto.status,
      priority: dto.priority,
      dueDate: dto.dueDate,
      assignedTo: dto.assignedTo,
      tags: dto.tags,
    };
  }

  /**
   * Map SubItem entities to SubItemDto array
   */
  private mapSubItemsToDto(subItems: SubItem[]): SubItemDto[] {
    return subItems.map((subItem) => {
      switch (subItem.type) {
        case 'text':
          return plainToClass(TextSubItemDto, subItem);
        case 'number':
          return plainToClass(NumberSubItemDto, subItem);
        case 'checklist':
          return plainToClass(ChecklistSubItemDto, subItem);
        case 'link':
          return plainToClass(LinkSubItemDto, subItem);
        case 'date':
          return plainToClass(DateSubItemDto, subItem);
        default:
          throw new Error(`Unknown SubItem type: ${(subItem as any).type}`);
      }
    });
  }

  /**
   * Map SubItemDto array to SubItem entities
   */
  private mapSubItemsToEntity(subItemDtos: SubItemDto[]): SubItem[] {
    return subItemDtos.map((dto) => {
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
    });
  }
}
