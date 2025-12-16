import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Session,
} from '@nestjs/common';
import { ClientTeamDto, CreateTeamDto, UpdateTeamDto, AddMemberDto, Role } from '@ai-nx-starter/types';
import { TeamService } from './team.service';
import { Authorize, SessionInfo } from '@ai-nx-starter/backend-common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Teams')
@ApiBearerAuth('bearer')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @ApiOperation({ summary: 'Get all teams', description: 'Retrieve list of all teams with optional pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of teams to return', example: 10 })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of teams to skip', example: 0 })
  @ApiResponse({ status: 200, description: 'Successfully retrieved teams', type: [ClientTeamDto] })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.User)
  @Get()
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<ClientTeamDto[]> {
    return await this.teamService.findAll(limit, offset);
  }

  @ApiOperation({ summary: 'Get team by ID', description: 'Find a specific team by ID with populated owner and members' })
  @ApiParam({ name: 'id', description: 'Team ID', example: 'team-123' })
  @ApiResponse({ status: 200, description: 'Successfully found team', type: ClientTeamDto })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.User)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ClientTeamDto> {
    return await this.teamService.findById(id);
  }

  @ApiOperation({
    summary: 'Create team',
    description: 'Create a new team. The creator automatically becomes the owner and is added to members. Team name must be unique.',
  })
  @ApiBody({ type: CreateTeamDto })
  @ApiResponse({ status: 201, description: 'Team successfully created', type: ClientTeamDto })
  @ApiResponse({ status: 400, description: 'Validation failed or team name already exists' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.User)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createTeamDto: CreateTeamDto, @Session() session: SessionInfo): Promise<ClientTeamDto> {
    return await this.teamService.create(createTeamDto, session.userId);
  }

  @ApiOperation({
    summary: 'Update team',
    description: 'Update an existing team. Only the team owner or Admin can update the team.',
  })
  @ApiParam({ name: 'id', description: 'Team ID to update', example: 'team-123' })
  @ApiBody({ type: UpdateTeamDto })
  @ApiResponse({ status: 200, description: 'Team successfully updated', type: ClientTeamDto })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions (only owner or Admin can update)' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.User)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTeamDto: UpdateTeamDto,
    @Session() session: SessionInfo,
  ): Promise<ClientTeamDto> {
    return await this.teamService.update(id, updateTeamDto, session.userId, session.role);
  }

  @ApiOperation({
    summary: 'Delete team',
    description: 'Permanently delete a team from the system. Only the team owner or Admin can delete the team.',
  })
  @ApiParam({ name: 'id', description: 'Team ID to delete', example: 'team-123' })
  @ApiResponse({ status: 204, description: 'Team successfully deleted' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions (only owner or Admin can delete)' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.User)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Session() session: SessionInfo): Promise<void> {
    await this.teamService.delete(id, session.userId, session.role);
  }

  @ApiOperation({
    summary: 'Add member to team',
    description: 'Add a user to team members. Only the team owner or Admin can add members.',
  })
  @ApiParam({ name: 'id', description: 'Team ID', example: 'team-123' })
  @ApiBody({ type: AddMemberDto })
  @ApiResponse({ status: 200, description: 'Member successfully added', type: ClientTeamDto })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions (only owner or Admin can add members)' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.User)
  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body(ValidationPipe) addMemberDto: AddMemberDto,
    @Session() session: SessionInfo,
  ): Promise<ClientTeamDto> {
    return await this.teamService.addMember(id, addMemberDto.userId, session.userId, session.role);
  }

  @ApiOperation({
    summary: 'Remove member from team',
    description: 'Remove a user from team members. Only the team owner or Admin can remove members.',
  })
  @ApiParam({ name: 'id', description: 'Team ID', example: 'team-123' })
  @ApiParam({ name: 'userId', description: 'User ID to remove', example: 'user-123' })
  @ApiResponse({ status: 200, description: 'Member successfully removed', type: ClientTeamDto })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions (only owner or Admin can remove members)' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Authorize(Role.User)
  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: string, @Param('userId') memberId: string, @Session() session: SessionInfo): Promise<ClientTeamDto> {
    return await this.teamService.removeMember(id, memberId, session.userId, session.role);
  }
}
