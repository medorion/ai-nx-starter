import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ClientUserDto, CreateUserDto, UpdateUserDto, Role } from '@ai-nx-starter/types';
import { UserService } from './user.service';
import { Authorize } from '@ai-nx-starter/backend-common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /users
   * Get all users with optional pagination
   */
  @Authorize(Role.Admin)
  @Get()
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<ClientUserDto[]> {
    return await this.userService.findAll(limit, offset);
  }

  /**
   * GET /users/count
   * Get total count of users
   */
  @Authorize(Role.Admin)
  @Get('count')
  async getCount(): Promise<{ count: number }> {
    const count = await this.userService.count();
    return { count };
  }

  /**
   * GET /users/email/:email
   * Get user by email
   */
  @Authorize(Role.Admin)
  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<ClientUserDto> {
    return await this.userService.findByEmail(email);
  }

  /**
   * GET /users/:id
   * Get user by ID
   */
  @Authorize(Role.Admin)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ClientUserDto> {
    return await this.userService.findById(id);
  }

  /**
   * POST /users
   * Create a new user
   */
  @Authorize(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<ClientUserDto> {
    return await this.userService.create(createUserDto);
  }

  /**
   * PUT /users/:id
   * Update an existing user
   */
  @Authorize(Role.Admin)
  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateUserDto: UpdateUserDto): Promise<ClientUserDto> {
    return await this.userService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id
   * Delete a user
   */
  @Authorize(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
