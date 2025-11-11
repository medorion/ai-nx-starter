import { NotFoundException } from '@nestjs/common';
import { ExampleService } from './example.service';
import { ExampleDto } from '@ai-nx-starter/types';

describe('ExampleService', () => {
  let service: ExampleService;

  beforeEach(() => {
    service = new ExampleService();
  });

  describe('findAll', () => {
    it('should return all examples', () => {
      const result = service.findAll();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(50);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('email');
    });

    it('should return examples with all required fields', () => {
      const result = service.findAll();

      result.forEach((example) => {
        expect(example).toHaveProperty('id');
        expect(example).toHaveProperty('name');
        expect(example).toHaveProperty('age');
        expect(example).toHaveProperty('email');
        expect(example).toHaveProperty('tags');
        expect(Array.isArray(example.tags)).toBe(true);
      });
    });
  });

  describe('findOne', () => {
    it('should return example by ID', () => {
      const result = service.findOne('1');

      expect(result.id).toBe('1');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john.doe@example.com');
    });

    it('should throw NotFoundException when example not found', () => {
      expect(() => service.findOne('999')).toThrow(NotFoundException);
      expect(() => service.findOne('999')).toThrow('Example with ID 999 not found');
    });

    it('should return different examples for different IDs', () => {
      const example1 = service.findOne('1');
      const example2 = service.findOne('2');

      expect(example1.id).not.toBe(example2.id);
      expect(example1.name).not.toBe(example2.name);
    });
  });

  describe('create', () => {
    it('should create new example with auto-generated ID', () => {
      const createData: Omit<ExampleDto, 'id'> = {
        name: 'New Person',
        age: 25,
        email: 'new@example.com',
        tags: ['test'],
      };

      const result = service.create(createData);

      expect(result.id).toBe('51');
      expect(result.name).toBe('New Person');
      expect(result.age).toBe(25);
      expect(result.email).toBe('new@example.com');
      expect(result.tags).toEqual(['test']);
    });

    it('should increment ID for each new example', () => {
      const createData: Omit<ExampleDto, 'id'> = {
        name: 'Test',
        age: 30,
        email: 'test@example.com',
        tags: [],
      };

      const first = service.create(createData);
      const second = service.create(createData);
      const third = service.create(createData);

      expect(first.id).toBe('51');
      expect(second.id).toBe('52');
      expect(third.id).toBe('53');
    });

    it('should add created example to the list', () => {
      const initialCount = service.count();

      service.create({
        name: 'New Example',
        age: 28,
        email: 'new@example.com',
        tags: [],
      });

      expect(service.count()).toBe(initialCount + 1);
    });

    it('should preserve all fields from create data', () => {
      const createData: Omit<ExampleDto, 'id'> = {
        name: 'Complete Test',
        age: 42,
        email: 'complete@test.com',
        tags: ['tag1', 'tag2', 'tag3'],
      };

      const result = service.create(createData);

      expect(result.name).toBe(createData.name);
      expect(result.age).toBe(createData.age);
      expect(result.email).toBe(createData.email);
      expect(result.tags).toEqual(createData.tags);
    });
  });

  describe('update', () => {
    it('should update existing example', () => {
      const updateData: Partial<ExampleDto> = {
        name: 'Updated Name',
        age: 35,
      };

      const result = service.update('1', updateData);

      expect(result.id).toBe('1');
      expect(result.name).toBe('Updated Name');
      expect(result.age).toBe(35);
    });

    it('should throw NotFoundException when updating non-existent example', () => {
      expect(() => service.update('999', { name: 'Test' })).toThrow(NotFoundException);
      expect(() => service.update('999', { name: 'Test' })).toThrow('Example with ID 999 not found');
    });

    it('should not allow changing ID', () => {
      const result = service.update('1', { id: '999', name: 'Test' });

      expect(result.id).toBe('1');
      expect(result.name).toBe('Test');
    });

    it('should preserve unchanged fields', () => {
      const original = service.findOne('1');
      const result = service.update('1', { name: 'New Name' });

      expect(result.id).toBe(original.id);
      expect(result.age).toBe(original.age);
      expect(result.email).toBe(original.email);
      expect(result.tags).toEqual(original.tags);
      expect(result.name).toBe('New Name');
    });

    it('should update multiple fields at once', () => {
      const updateData: Partial<ExampleDto> = {
        name: 'Multi Update',
        age: 99,
        tags: ['updated', 'multiple'],
      };

      const result = service.update('1', updateData);

      expect(result.name).toBe('Multi Update');
      expect(result.age).toBe(99);
      expect(result.tags).toEqual(['updated', 'multiple']);
    });
  });

  describe('remove', () => {
    it('should remove existing example', () => {
      const initialCount = service.count();

      service.remove('1');

      expect(service.count()).toBe(initialCount - 1);
      expect(() => service.findOne('1')).toThrow(NotFoundException);
    });

    it('should throw NotFoundException when removing non-existent example', () => {
      expect(() => service.remove('999')).toThrow(NotFoundException);
      expect(() => service.remove('999')).toThrow('Example with ID 999 not found');
    });

    it('should not affect other examples', () => {
      const example2 = service.findOne('2');
      const example3 = service.findOne('3');

      service.remove('1');

      expect(service.findOne('2')).toEqual(example2);
      expect(service.findOne('3')).toEqual(example3);
    });
  });

  describe('findByName', () => {
    it('should find examples by name (case-insensitive)', () => {
      const result = service.findByName('john');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((e) => e.name.toLowerCase().includes('john'))).toBe(true);
    });

    it('should find examples with partial name match', () => {
      const result = service.findByName('doe');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((e) => e.name.toLowerCase().includes('doe'))).toBe(true);
    });

    it('should return empty array when no matches found', () => {
      const result = service.findByName('NonExistentName123');

      expect(result).toEqual([]);
    });

    it('should be case-insensitive', () => {
      const lowerResult = service.findByName('john');
      const upperResult = service.findByName('JOHN');
      const mixedResult = service.findByName('JoHn');

      expect(lowerResult).toEqual(upperResult);
      expect(upperResult).toEqual(mixedResult);
    });

    it('should find multiple examples with common name parts', () => {
      const result = service.findByName('smith');

      expect(result.length).toBeGreaterThan(0);
      result.forEach((example) => {
        expect(example.name.toLowerCase()).toContain('smith');
      });
    });
  });

  describe('count', () => {
    it('should return correct count of examples', () => {
      const result = service.count();

      expect(result).toBe(50);
    });

    it('should update count after adding example', () => {
      const initialCount = service.count();

      service.create({
        name: 'Test',
        age: 25,
        email: 'test@example.com',
        tags: [],
      });

      expect(service.count()).toBe(initialCount + 1);
    });

    it('should update count after removing example', () => {
      const initialCount = service.count();

      service.remove('1');

      expect(service.count()).toBe(initialCount - 1);
    });

    it('should not change count after update', () => {
      const initialCount = service.count();

      service.update('1', { name: 'Updated' });

      expect(service.count()).toBe(initialCount);
    });
  });
});
