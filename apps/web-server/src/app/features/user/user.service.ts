import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ClientUserDto, CreateUserDto, UpdateUserDto } from '@ai-nx-starter/types';
import { UserDbService } from '@ai-nx-starter/data-access-layer';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserService {
  constructor(
    private readonly userDbService: UserDbService,
    private readonly userMapper: UserMapper,
  ) {}

  /**
   * Get all users with optional pagination
   */
  async findAll(limit = 50, offset = 0): Promise<ClientUserDto[]> {
    const entities = await this.userDbService.findAll(limit, offset);
    return this.userMapper.toDtoArray(entities);
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<ClientUserDto> {
    const entity = await this.userDbService.findById(id);
    if (!entity) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.userMapper.toDto(entity);
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<ClientUserDto> {
    const entity = await this.userDbService.findByEmail(email);
    if (!entity) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.userMapper.toDto(entity);
  }

  /**
   * Get total count of users
   */
  async count(): Promise<number> {
    return await this.userDbService.count();
  }

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<ClientUserDto> {
    // Check if user with email already exists
    const existingUser = await this.userDbService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const entity = await this.userDbService.create(createUserDto);
    return this.userMapper.toDto(entity);
  }

  /**
   * Update an existing user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<ClientUserDto> {
    // Check if user exists
    const existingUser = await this.userDbService.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If email is being updated, check if it's already taken by another user
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userDbService.findByEmail(updateUserDto.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException(`User with email ${updateUserDto.email} already exists`);
      }
    }

    const updatedEntity = await this.userDbService.update(id, updateUserDto);
    if (!updatedEntity) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }

    return this.userMapper.toDto(updatedEntity);
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    const entity = await this.userDbService.findById(id);
    if (!entity) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deleted = await this.userDbService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Failed to delete user with ID ${id}`);
    }
  }
}
