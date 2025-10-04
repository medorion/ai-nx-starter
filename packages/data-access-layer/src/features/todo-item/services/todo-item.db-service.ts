import { MongoRepository, ObjectId } from 'typeorm';
import { TodoItem, SubItem } from '../entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export interface CreateTodoItemData {
  title: string;
  description?: string;
  subItems?: SubItem[];
  status?: 'pending' | 'in_progress' | 'completed' | 'archived';
  priority?: number;
  dueDate?: Date;
  assignedTo?: string;
  tags?: string[];
}

export interface UpdateTodoItemData {
  title?: string;
  description?: string;
  subItems?: SubItem[];
  status?: 'pending' | 'in_progress' | 'completed' | 'archived';
  priority?: number;
  dueDate?: Date;
  assignedTo?: string;
  tags?: string[];
}

@Injectable()
export class TodoItemDbService {
  constructor(@InjectRepository(TodoItem)
              private todoItemRepository: MongoRepository<TodoItem>) {}

  async findById(id: string): Promise<TodoItem | null> {
    try {
      const objectId = new ObjectId(id);
      return await this.todoItemRepository.findOne({ where: { _id: objectId } });
    } catch (error) {
      return null;
    }
  }

  async findAll(limit = 50, offset = 0): Promise<TodoItem[]> {
    return await this.todoItemRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: 'pending' | 'in_progress' | 'completed' | 'archived'): Promise<TodoItem[]> {
    return await this.todoItemRepository.find({
      where: { status },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByAssignee(assignedTo: string): Promise<TodoItem[]> {
    return await this.todoItemRepository.find({
      where: { assignedTo },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByTags(tags: string[]): Promise<TodoItem[]> {
    return await this.todoItemRepository.find({
      where: { tags: { $in: tags } },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOverdueTodos(): Promise<TodoItem[]> {
    const now = new Date();
    return await this.todoItemRepository.find({
      where: {
        dueDate: { $lt: now },
        status: { $in: ['pending', 'in_progress'] },
      },
      order: { dueDate: 'ASC' },
    });
  }

  async create(todoData: CreateTodoItemData): Promise<TodoItem> {
    const todo = this.todoItemRepository.create({
      ...todoData,
      subItems: todoData.subItems || [],
    });
    return await this.todoItemRepository.save(todo);
  }

  async update(id: string, updateData: UpdateTodoItemData): Promise<TodoItem | null> {
    try {
      const objectId = new ObjectId(id);
      const updateResult = await this.todoItemRepository.update({ _id: objectId }, { ...updateData, updatedAt: new Date() });

      if ((updateResult.affected ?? 0) === 0) {
        return null;
      }

      return await this.todoItemRepository.findOne({ where: { _id: objectId } });
    } catch (error) {
      return null;
    }
  }

  async addSubItem(id: string, subItem: SubItem): Promise<TodoItem | null> {
    try {
      const objectId = new ObjectId(id);
      const todo = await this.todoItemRepository.findOne({ where: { _id: objectId } });

      if (!todo) {
        return null;
      }

      todo.subItems.push(subItem);
      return await this.todoItemRepository.save(todo);
    } catch (error) {
      return null;
    }
  }

  async removeSubItem(id: string, subItemIndex: number): Promise<TodoItem | null> {
    try {
      const objectId = new ObjectId(id);
      const todo = await this.todoItemRepository.findOne({ where: { _id: objectId } });

      if (!todo || subItemIndex < 0 || subItemIndex >= todo.subItems.length) {
        return null;
      }

      todo.subItems.splice(subItemIndex, 1);
      return await this.todoItemRepository.save(todo);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const result = await this.todoItemRepository.delete({ _id: objectId });
      return (result.affected ?? 0) > 0;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    return await this.todoItemRepository.count();
  }

  async countByStatus(status: 'pending' | 'in_progress' | 'completed' | 'archived'): Promise<number> {
    return await this.todoItemRepository.count({ where: { status } });
  }
}

