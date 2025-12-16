import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ClientTeamDto, CreateTeamDto, UpdateTeamDto, Role } from '@ai-nx-starter/types';
import { TeamDbService, UserDbService } from '@ai-nx-starter/data-access-layer';
import { TeamMapper } from './team.mapper';
import { ObjectId } from 'mongodb';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamDbService: TeamDbService,
    private readonly userDbService: UserDbService,
    private readonly teamMapper: TeamMapper,
  ) {}

  /**
   * Get all teams with optional pagination
   */
  async findAll(limit = 50, offset = 0): Promise<ClientTeamDto[]> {
    const entities = await this.teamDbService.findAll(limit, offset);
    return await this.teamMapper.toDtoArrayWithRelations(entities);
  }

  /**
   * Get team by ID with populated owner and members
   */
  async findById(id: string): Promise<ClientTeamDto> {
    const entity = await this.teamDbService.findById(id);
    if (!entity) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return await this.teamMapper.toDtoWithRelations(entity);
  }

  /**
   * Create a new team
   * Creator automatically becomes owner and is added to members
   */
  async create(createTeamDto: CreateTeamDto, userId: string): Promise<ClientTeamDto> {
    // Check if team with name already exists
    const existingTeam = await this.teamDbService.findByName(createTeamDto.name);
    if (existingTeam) {
      throw new ConflictException(`Team with name "${createTeamDto.name}" already exists`);
    }

    // Verify user exists
    const user = await this.userDbService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Create team with owner and add owner to members
    const ownerObjectId = new ObjectId(userId);
    const entity = await this.teamDbService.create({
      name: createTeamDto.name,
      description: createTeamDto.description,
      ownerId: ownerObjectId,
      memberIds: [ownerObjectId], // Owner is automatically a member
    });

    return await this.teamMapper.toDtoWithRelations(entity);
  }

  /**
   * Update an existing team
   * Only owner or Admin can update
   */
  async update(id: string, updateTeamDto: UpdateTeamDto, userId: string, userRole: Role): Promise<ClientTeamDto> {
    // Check if team exists
    const existingTeam = await this.teamDbService.findById(id);
    if (!existingTeam) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Check authorization: only owner or Admin can update
    if (existingTeam.ownerId.toString() !== userId && userRole !== Role.Admin) {
      throw new ForbiddenException('Only the team owner or Admin can update this team');
    }

    // If name is being updated, check if it's already taken by another team
    if (updateTeamDto.name && updateTeamDto.name !== existingTeam.name) {
      const teamWithName = await this.teamDbService.findByName(updateTeamDto.name);
      if (teamWithName && teamWithName.id !== id) {
        throw new ConflictException(`Team with name "${updateTeamDto.name}" already exists`);
      }
    }

    const updatedEntity = await this.teamDbService.update(id, updateTeamDto);
    if (!updatedEntity) {
      throw new NotFoundException(`Failed to update team with ID ${id}`);
    }

    return await this.teamMapper.toDtoWithRelations(updatedEntity);
  }

  /**
   * Delete a team
   * Only owner or Admin can delete
   */
  async delete(id: string, userId: string, userRole: Role): Promise<void> {
    const entity = await this.teamDbService.findById(id);
    if (!entity) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Check authorization: only owner or Admin can delete
    if (entity.ownerId.toString() !== userId && userRole !== Role.Admin) {
      throw new ForbiddenException('Only the team owner or Admin can delete this team');
    }

    const deleted = await this.teamDbService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Failed to delete team with ID ${id}`);
    }
  }

  /**
   * Add a member to the team
   * Only owner or Admin can add members
   */
  async addMember(teamId: string, memberUserId: string, currentUserId: string, currentUserRole: Role): Promise<ClientTeamDto> {
    // Check if team exists
    const team = await this.teamDbService.findById(teamId);
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check authorization: only owner or Admin can add members
    if (team.ownerId.toString() !== currentUserId && currentUserRole !== Role.Admin) {
      throw new ForbiddenException('Only the team owner or Admin can add members');
    }

    // Verify member user exists
    const memberUser = await this.userDbService.findById(memberUserId);
    if (!memberUser) {
      throw new NotFoundException(`User with ID ${memberUserId} not found`);
    }

    // Add member
    const updatedTeam = await this.teamDbService.addMember(teamId, memberUserId);
    if (!updatedTeam) {
      throw new BadRequestException('Failed to add member to team');
    }

    return await this.teamMapper.toDtoWithRelations(updatedTeam);
  }

  /**
   * Remove a member from the team
   * Only owner or Admin can remove members
   */
  async removeMember(teamId: string, memberUserId: string, currentUserId: string, currentUserRole: Role): Promise<ClientTeamDto> {
    // Check if team exists
    const team = await this.teamDbService.findById(teamId);
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check authorization: only owner or Admin can remove members
    if (team.ownerId.toString() !== currentUserId && currentUserRole !== Role.Admin) {
      throw new ForbiddenException('Only the team owner or Admin can remove members');
    }

    // Don't allow removing the owner
    if (team.ownerId.toString() === memberUserId) {
      throw new BadRequestException('Cannot remove the team owner from members');
    }

    // Remove member
    const updatedTeam = await this.teamDbService.removeMember(teamId, memberUserId);
    if (!updatedTeam) {
      throw new BadRequestException('Failed to remove member from team');
    }

    return await this.teamMapper.toDtoWithRelations(updatedTeam);
  }
}
