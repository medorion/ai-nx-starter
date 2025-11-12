import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseIntPipe, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ClientUserDto, CreateUserDto, UpdateUserDto, Role } from '@ai-nx-starter/types';
import { UserService } from './user.service';
import { Authorize } from '@ai-nx-starter/backend-common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all users', description: 'Retrieve list of all users with optional pagination. Requires Admin role.' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of users to return', example: 10 })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of users to skip', example: 0 })
  @ApiResponse({ status: 200, description: 'Successfully retrieved users', type: [ClientUserDto] })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions (requires Admin)' })
  @Authorize(Role.Admin)
  @Get()
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<ClientUserDto[]> {
    return await this.userService.findAll(limit, offset);
  }

  @ApiOperation({ summary: 'Get user count', description: 'Get total number of users in the system' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved count',
    schema: { type: 'object', properties: { count: { type: 'number', example: 42 } } },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.Admin)
  @Get('count')
  async getCount(): Promise<{ count: number }> {
    const count = await this.userService.count();
    return { count };
  }

  @ApiOperation({ summary: 'Get user by email', description: 'Find a specific user by their email address' })
  @ApiParam({ name: 'email', description: 'User email address', example: 'john.doe@example.com' })
  @ApiResponse({ status: 200, description: 'Successfully found user', type: ClientUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Authorize(Role.Admin)
  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<ClientUserDto> {
    return await this.userService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Get user by ID', description: 'Find a specific user by their ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'user-123' })
  @ApiResponse({ status: 200, description: 'Successfully found user', type: ClientUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Authorize(Role.Admin)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ClientUserDto> {
    return await this.userService.findById(id);
  }

  @ApiOperation({ summary: 'Create user', description: 'Create a new user. Email must be unique. Password will be hashed automatically.' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully created', type: ClientUserDto })
  @ApiResponse({ status: 400, description: 'Validation failed or email already exists' })
  @Authorize(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<ClientUserDto> {
    return await this.userService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Update user',
    description: 'Update an existing user. All fields are optional. Password will be hashed if provided.',
  })
  @ApiParam({ name: 'id', description: 'User ID to update', example: 'user-123' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User successfully updated', type: ClientUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Authorize(Role.Admin)
  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateUserDto: UpdateUserDto): Promise<ClientUserDto> {
    return await this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user', description: 'Permanently delete a user from the system' })
  @ApiParam({ name: 'id', description: 'User ID to delete', example: 'user-123' })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Authorize(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
