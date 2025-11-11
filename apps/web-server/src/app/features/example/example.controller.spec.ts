import { Test, TestingModule } from '@nestjs/testing';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { ExampleDto } from '@ai-nx-starter/types';

describe('ExampleController', () => {
  let controller: ExampleController;
  let service: jest.Mocked<ExampleService>;

  const mockExample: ExampleDto = {
    id: '1',
    name: 'Test Example',
    age: 25,
    email: 'test@example.com',
    tags: ['test', 'example'],
  };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByName: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleController],
      providers: [{ provide: ExampleService, useValue: mockService }],
    }).compile();

    controller = module.get<ExampleController>(ExampleController);
    service = module.get(ExampleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all examples when no name query provided', () => {
      const examples = [mockExample];
      service.findAll.mockReturnValue(examples);

      const result = controller.findAll();

      expect(result).toEqual(examples);
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findByName).not.toHaveBeenCalled();
    });

    it('should filter by name when name query provided', () => {
      const examples = [mockExample];
      service.findByName.mockReturnValue(examples);

      const result = controller.findAll('Test');

      expect(result).toEqual(examples);
      expect(service.findByName).toHaveBeenCalledWith('Test');
      expect(service.findAll).not.toHaveBeenCalled();
    });

    it('should return empty array when no matches found', () => {
      service.findByName.mockReturnValue([]);

      const result = controller.findAll('NonExistent');

      expect(result).toEqual([]);
      expect(service.findByName).toHaveBeenCalledWith('NonExistent');
    });
  });

  describe('getCount', () => {
    it('should return count of examples', () => {
      service.count.mockReturnValue(42);

      const result = controller.getCount();

      expect(result).toEqual({ count: 42 });
      expect(service.count).toHaveBeenCalled();
    });

    it('should return zero when no examples', () => {
      service.count.mockReturnValue(0);

      const result = controller.getCount();

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('findOne', () => {
    it('should return example by ID', () => {
      service.findOne.mockReturnValue(mockExample);

      const result = controller.findOne('1');

      expect(result).toEqual(mockExample);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should propagate NotFoundException from service', () => {
      service.findOne.mockImplementation(() => {
        throw new Error('Not found');
      });

      expect(() => controller.findOne('999')).toThrow('Not found');
    });
  });

  describe('create', () => {
    it('should create new example', () => {
      const createDto: Omit<ExampleDto, 'id'> = {
        name: 'New Example',
        age: 30,
        email: 'new@example.com',
        tags: ['new'],
      };
      const created = { id: '51', ...createDto };

      service.create.mockReturnValue(created);

      const result = controller.create(createDto);

      expect(result).toEqual(created);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should create example with all fields', () => {
      const createDto: Omit<ExampleDto, 'id'> = {
        name: 'Complete Example',
        age: 35,
        email: 'complete@example.com',
        tags: ['tag1', 'tag2', 'tag3'],
      };
      const created = { id: '100', ...createDto };

      service.create.mockReturnValue(created);

      const result = controller.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(result.age).toBe(createDto.age);
      expect(result.email).toBe(createDto.email);
      expect(result.tags).toEqual(createDto.tags);
    });
  });

  describe('update', () => {
    it('should update existing example', () => {
      const updateDto: Partial<ExampleDto> = {
        name: 'Updated Name',
        age: 26,
      };
      const updated = { ...mockExample, ...updateDto };

      service.update.mockReturnValue(updated);

      const result = controller.update('1', updateDto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should allow partial updates', () => {
      const updateDto: Partial<ExampleDto> = {
        name: 'Only Name Updated',
      };
      const updated = { ...mockExample, name: 'Only Name Updated' };

      service.update.mockReturnValue(updated);

      const result = controller.update('1', updateDto);

      expect(result.name).toBe('Only Name Updated');
      expect(result.age).toBe(mockExample.age);
    });

    it('should propagate NotFoundException when updating non-existent example', () => {
      service.update.mockImplementation(() => {
        throw new Error('Not found');
      });

      expect(() => controller.update('999', { name: 'Test' })).toThrow('Not found');
    });
  });

  describe('advancedUpdate', () => {
    it('should handle advanced update with all parameters', () => {
      const session = { id: 'session123', userId: 'user456' };
      const updateData = { notes: 'Test notes', metadata: { key: 'value' } };

      const result = controller.advancedUpdate('1', 'status1', session, updateData, 'high', 'work', 'john@example.com', '2025-12-31');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Advanced update completed for example 1');
      expect(result.data.id).toBe('1');
      expect(result.data.statusId).toBe('status1');
      expect(result.data.priority).toBe('high');
      expect(result.data.category).toBe('work');
      expect(result.data.assignee).toBe('john@example.com');
      expect(result.data.dueDate).toBe('2025-12-31');
      expect(result.data.sessionInfo.sessionId).toBe('session123');
      expect(result.data.sessionInfo.userId).toBe('user456');
      expect(result.data.updateData).toEqual(updateData);
    });

    it('should use default values when optional query parameters not provided', () => {
      const session = { id: 'session123' };
      const updateData = { notes: 'Notes' };

      const result = controller.advancedUpdate('2', 'status2', session, updateData);

      expect(result.data.priority).toBe('medium');
      expect(result.data.category).toBe('general');
      expect(result.data.assignee).toBe('unassigned');
      expect(result.data.dueDate).toBeDefined();
    });

    it('should handle session without userId', () => {
      const session = { id: 'session999' };
      const updateData = {};

      const result = controller.advancedUpdate('3', 'status3', session, updateData);

      expect(result.data.sessionInfo.userId).toBe('anonymous');
      expect(result.data.sessionInfo.sessionId).toBe('session999');
    });

    it('should generate session ID when session is empty', () => {
      const session = {};
      const updateData = {};

      const result = controller.advancedUpdate('4', 'status4', session, updateData);

      expect(result.data.sessionInfo.sessionId).toMatch(/^session_\d+$/);
      expect(result.data.sessionInfo.userId).toBe('anonymous');
    });

    it('should include timestamp in session info', () => {
      const session = { id: 'session123' };
      const updateData = {};

      const beforeTime = new Date().toISOString();
      const result = controller.advancedUpdate('5', 'status5', session, updateData);
      const afterTime = new Date().toISOString();

      expect(result.data.sessionInfo.timestamp).toBeDefined();
      expect(result.data.sessionInfo.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(result.data.sessionInfo.timestamp >= beforeTime).toBe(true);
      expect(result.data.sessionInfo.timestamp <= afterTime).toBe(true);
    });

    it('should include processedBy field', () => {
      const session = {};
      const updateData = {};

      const result = controller.advancedUpdate('6', 'status6', session, updateData);

      expect(result.data.processedBy).toBe('Monorepo Kit System v2.0');
    });
  });

  describe('remove', () => {
    it('should delete example by ID', () => {
      service.remove.mockReturnValue(undefined);

      const result = controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should propagate NotFoundException when deleting non-existent example', () => {
      service.remove.mockImplementation(() => {
        throw new Error('Not found');
      });

      expect(() => controller.remove('999')).toThrow('Not found');
    });
  });
});
