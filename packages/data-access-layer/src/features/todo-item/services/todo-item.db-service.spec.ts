import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository, ObjectId } from 'typeorm';
import { TodoItemDbService } from './todo-item.db-service';
import { TodoItem, SubItem } from '../entities';

describe('TodoItemDbService', () => {
  let service: TodoItemDbService;
  let repository: jest.Mocked<MongoRepository<TodoItem>>;

  const mockObjectId = new ObjectId('507f1f77bcf86cd799439011');
  const mockObjectId2 = new ObjectId('507f1f77bcf86cd799439012');

  const mockTodoItem: TodoItem = {
    _id: mockObjectId,
    title: 'Test Todo',
    description: 'Test Description',
    subItems: [],
    status: 'pending',
    priority: 1,
    dueDate: new Date('2025-12-31'),
    assignedTo: 'user@example.com',
    tags: ['test', 'important'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    get id() {
      return this._id.toString();
    },
  };

  const mockSubItem: SubItem = {
    type: 'text',
    content: 'Test sub-item',
    metadata: { key: 'value' },
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoItemDbService,
        {
          provide: getRepositoryToken(TodoItem),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TodoItemDbService>(TodoItemDbService);
    repository = module.get(getRepositoryToken(TodoItem));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find todo item by valid ObjectId', async () => {
      repository.findOne.mockResolvedValue(mockTodoItem);

      const result = await service.findById(mockObjectId.toString());

      expect(result).toEqual(mockTodoItem);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { _id: expect.any(ObjectId) },
      });
    });

    it('should return null when todo item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(mockObjectId.toString());

      expect(result).toBeNull();
    });

    it('should return null for invalid ObjectId', async () => {
      const result = await service.findById('invalid-id');

      expect(result).toBeNull();
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.findById(mockObjectId.toString());

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all todos with default pagination', async () => {
      const todos = [mockTodoItem];
      repository.find.mockResolvedValue(todos);

      const result = await service.findAll();

      expect(result).toEqual(todos);
      expect(repository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        order: { createdAt: 'DESC' },
      });
    });

    it('should find todos with custom limit and offset', async () => {
      const todos = [mockTodoItem];
      repository.find.mockResolvedValue(todos);

      const result = await service.findAll(10, 20);

      expect(result).toEqual(todos);
      expect(repository.find).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no todos found', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByStatus', () => {
    it('should find todos by pending status', async () => {
      const pendingTodos = [mockTodoItem];
      repository.find.mockResolvedValue(pendingTodos);

      const result = await service.findByStatus('pending');

      expect(result).toEqual(pendingTodos);
      expect(repository.find).toHaveBeenCalledWith({
        where: { status: 'pending' },
        order: { priority: 'DESC', createdAt: 'DESC' },
      });
    });

    it('should find todos by in_progress status', async () => {
      repository.find.mockResolvedValue([mockTodoItem]);

      const result = await service.findByStatus('in_progress');

      expect(result).toEqual([mockTodoItem]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { status: 'in_progress' },
        order: { priority: 'DESC', createdAt: 'DESC' },
      });
    });

    it('should find todos by completed status', async () => {
      repository.find.mockResolvedValue([mockTodoItem]);

      const result = await service.findByStatus('completed');

      expect(result).toEqual([mockTodoItem]);
    });

    it('should find todos by archived status', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findByStatus('archived');

      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { status: 'archived' },
        order: { priority: 'DESC', createdAt: 'DESC' },
      });
    });
  });

  describe('findByAssignee', () => {
    it('should find todos assigned to specific user', async () => {
      const assignedTodos = [mockTodoItem];
      repository.find.mockResolvedValue(assignedTodos);

      const result = await service.findByAssignee('user@example.com');

      expect(result).toEqual(assignedTodos);
      expect(repository.find).toHaveBeenCalledWith({
        where: { assignedTo: 'user@example.com' },
        order: { priority: 'DESC', createdAt: 'DESC' },
      });
    });

    it('should return empty array when no todos assigned to user', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findByAssignee('nonexistent@example.com');

      expect(result).toEqual([]);
    });
  });

  describe('findByTags', () => {
    it('should find todos by single tag', async () => {
      const taggedTodos = [mockTodoItem];
      repository.find.mockResolvedValue(taggedTodos);

      const result = await service.findByTags(['test']);

      expect(result).toEqual(taggedTodos);
      expect(repository.find).toHaveBeenCalledWith({
        where: { tags: { $in: ['test'] } },
        order: { priority: 'DESC', createdAt: 'DESC' },
      });
    });

    it('should find todos by multiple tags', async () => {
      const taggedTodos = [mockTodoItem];
      repository.find.mockResolvedValue(taggedTodos);

      const result = await service.findByTags(['test', 'important', 'urgent']);

      expect(result).toEqual(taggedTodos);
      expect(repository.find).toHaveBeenCalledWith({
        where: { tags: { $in: ['test', 'important', 'urgent'] } },
        order: { priority: 'DESC', createdAt: 'DESC' },
      });
    });

    it('should return empty array when no todos match tags', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findByTags(['nonexistent']);

      expect(result).toEqual([]);
    });
  });

  describe('findOverdueTodos', () => {
    it('should find overdue todos with pending or in_progress status', async () => {
      const overdueTodos = [mockTodoItem];
      repository.find.mockResolvedValue(overdueTodos);

      const result = await service.findOverdueTodos();

      expect(result).toEqual(overdueTodos);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          dueDate: { $lt: expect.any(Date) },
          status: { $in: ['pending', 'in_progress'] },
        },
        order: { dueDate: 'ASC' },
      });
    });

    it('should not include completed todos in overdue results', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findOverdueTodos();

      const callArgs = repository.find.mock.calls[0][0] as any;
      expect(callArgs?.where?.status).toEqual({ $in: ['pending', 'in_progress'] });
    });

    it('should order overdue todos by dueDate ascending', async () => {
      repository.find.mockResolvedValue([]);

      await service.findOverdueTodos();

      const callArgs = repository.find.mock.calls[0][0] as any;
      expect(callArgs?.order).toEqual({ dueDate: 'ASC' });
    });
  });

  describe('create', () => {
    it('should create todo with all fields', async () => {
      const createData = {
        title: 'New Todo',
        description: 'Description',
        status: 'pending' as const,
        priority: 2,
        dueDate: new Date('2026-01-01'),
        assignedTo: 'user@example.com',
        tags: ['new', 'test'],
        subItems: [mockSubItem],
      };

      repository.create.mockReturnValue(mockTodoItem);
      repository.save.mockResolvedValue(mockTodoItem);

      const result = await service.create(createData);

      expect(result).toEqual(mockTodoItem);
      expect(repository.create).toHaveBeenCalledWith({
        ...createData,
        subItems: [mockSubItem],
      });
      expect(repository.save).toHaveBeenCalledWith(mockTodoItem);
    });

    it('should create todo with minimal required fields', async () => {
      const createData = {
        title: 'Minimal Todo',
      };

      repository.create.mockReturnValue(mockTodoItem);
      repository.save.mockResolvedValue(mockTodoItem);

      const result = await service.create(createData);

      expect(result).toEqual(mockTodoItem);
      expect(repository.create).toHaveBeenCalledWith({
        ...createData,
        subItems: [],
      });
    });

    it('should default subItems to empty array when not provided', async () => {
      const createData = {
        title: 'Todo without subItems',
        description: 'Test',
      };

      repository.create.mockReturnValue(mockTodoItem);
      repository.save.mockResolvedValue(mockTodoItem);

      await service.create(createData);

      expect(repository.create).toHaveBeenCalledWith({
        ...createData,
        subItems: [],
      });
    });
  });

  describe('update', () => {
    it('should update existing todo', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        status: 'in_progress' as const,
      };

      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      repository.findOne.mockResolvedValue(mockTodoItem);

      const result = await service.update(mockObjectId.toString(), updateData);

      expect(result).toEqual(mockTodoItem);
      expect(repository.update).toHaveBeenCalledWith({ _id: expect.any(ObjectId) }, { ...updateData, updatedAt: expect.any(Date) });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { _id: expect.any(ObjectId) },
      });
    });

    it('should return null when todo not found', async () => {
      repository.update.mockResolvedValue({ affected: 0, raw: {}, generatedMaps: [] });

      const result = await service.update(mockObjectId.toString(), { title: 'New Title' });

      expect(result).toBeNull();
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should return null for invalid ObjectId', async () => {
      const result = await service.update('invalid-id', { title: 'New Title' });

      expect(result).toBeNull();
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      repository.update.mockRejectedValue(new Error('Database error'));

      const result = await service.update(mockObjectId.toString(), { title: 'New Title' });

      expect(result).toBeNull();
    });

    it('should update only specified fields', async () => {
      const updateData = { priority: 5 };

      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      repository.findOne.mockResolvedValue(mockTodoItem);

      const result = await service.update(mockObjectId.toString(), updateData);

      expect(repository.update).toHaveBeenCalledWith({ _id: expect.any(ObjectId) }, { priority: 5, updatedAt: expect.any(Date) });
      expect(result).toEqual(mockTodoItem);
    });
  });

  describe('addSubItem', () => {
    it('should add sub-item to existing todo', async () => {
      repository.findOne.mockResolvedValue(mockTodoItem);
      repository.save.mockResolvedValue(mockTodoItem);

      const result = await service.addSubItem(mockObjectId.toString(), mockSubItem);

      expect(result).toEqual(mockTodoItem);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { _id: expect.any(ObjectId) },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockTodoItem,
        subItems: [mockSubItem],
      });
    });

    it('should add multiple sub-items sequentially', async () => {
      const subItem2: SubItem = {
        type: 'text',
        content: 'Second sub-item',
      };

      repository.findOne.mockResolvedValue(mockTodoItem);
      repository.save.mockResolvedValue(mockTodoItem);

      await service.addSubItem(mockObjectId.toString(), mockSubItem);
      const result = await service.addSubItem(mockObjectId.toString(), subItem2);

      expect(result).toEqual(mockTodoItem);
      expect(repository.save).toHaveBeenCalledTimes(2);
    });

    it('should return null when todo not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.addSubItem(mockObjectId.toString(), mockSubItem);

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return null for invalid ObjectId', async () => {
      const result = await service.addSubItem('invalid-id', mockSubItem);

      expect(result).toBeNull();
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.addSubItem(mockObjectId.toString(), mockSubItem);

      expect(result).toBeNull();
    });
  });

  describe('removeSubItem', () => {
    it('should remove sub-item at valid index', async () => {
      const todoWithSubItems = Object.assign(Object.create(Object.getPrototypeOf(mockTodoItem)), {
        ...mockTodoItem,
        subItems: [mockSubItem, { ...mockSubItem, content: 'Second' }],
      });

      repository.findOne.mockResolvedValue(todoWithSubItems);
      repository.save.mockResolvedValue(mockTodoItem);

      const result = await service.removeSubItem(mockObjectId.toString(), 0);

      expect(result).toEqual(mockTodoItem);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return null when todo not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.removeSubItem(mockObjectId.toString(), 0);

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return null for negative index', async () => {
      const todoWithSubItems = Object.assign(Object.create(Object.getPrototypeOf(mockTodoItem)), {
        ...mockTodoItem,
        subItems: [mockSubItem],
      });
      repository.findOne.mockResolvedValue(todoWithSubItems);

      const result = await service.removeSubItem(mockObjectId.toString(), -1);

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return null for index out of bounds', async () => {
      const todoWithSubItems = Object.assign(Object.create(Object.getPrototypeOf(mockTodoItem)), {
        ...mockTodoItem,
        subItems: [mockSubItem],
      });
      repository.findOne.mockResolvedValue(todoWithSubItems);

      const result = await service.removeSubItem(mockObjectId.toString(), 5);

      expect(result).toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return null for invalid ObjectId', async () => {
      const result = await service.removeSubItem('invalid-id', 0);

      expect(result).toBeNull();
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.removeSubItem(mockObjectId.toString(), 0);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing todo', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.delete(mockObjectId.toString());

      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return false when todo not found', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      const result = await service.delete(mockObjectId.toString());

      expect(result).toBe(false);
    });

    it('should return false for invalid ObjectId', async () => {
      const result = await service.delete('invalid-id');

      expect(result).toBe(false);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      repository.delete.mockRejectedValue(new Error('Database error'));

      const result = await service.delete(mockObjectId.toString());

      expect(result).toBe(false);
    });

    it('should handle undefined affected property', async () => {
      repository.delete.mockResolvedValue({ affected: undefined, raw: {} });

      const result = await service.delete(mockObjectId.toString());

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return total count of todos', async () => {
      repository.count.mockResolvedValue(42);

      const result = await service.count();

      expect(result).toBe(42);
      expect(repository.count).toHaveBeenCalledWith();
    });

    it('should return zero when no todos exist', async () => {
      repository.count.mockResolvedValue(0);

      const result = await service.count();

      expect(result).toBe(0);
    });
  });

  describe('countByStatus', () => {
    it('should count pending todos', async () => {
      repository.count.mockResolvedValue(10);

      const result = await service.countByStatus('pending');

      expect(result).toBe(10);
      expect(repository.count).toHaveBeenCalledWith({ where: { status: 'pending' } });
    });

    it('should count in_progress todos', async () => {
      repository.count.mockResolvedValue(5);

      const result = await service.countByStatus('in_progress');

      expect(result).toBe(5);
      expect(repository.count).toHaveBeenCalledWith({ where: { status: 'in_progress' } });
    });

    it('should count completed todos', async () => {
      repository.count.mockResolvedValue(25);

      const result = await service.countByStatus('completed');

      expect(result).toBe(25);
    });

    it('should count archived todos', async () => {
      repository.count.mockResolvedValue(3);

      const result = await service.countByStatus('archived');

      expect(result).toBe(3);
    });

    it('should return zero when no todos match status', async () => {
      repository.count.mockResolvedValue(0);

      const result = await service.countByStatus('archived');

      expect(result).toBe(0);
    });
  });
});
