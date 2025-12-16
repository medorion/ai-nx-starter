import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Team } from '../entities/team.entity';

@Injectable()
export class TeamDbService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: MongoRepository<Team>,
  ) {}

  async findById(id: string): Promise<Team | null> {
    try {
      const objectId = new ObjectId(id);
      return await this.teamRepository.findOneBy({ _id: objectId } as any);
    } catch {
      return null;
    }
  }

  async findAll(limit = 50, offset = 0): Promise<Team[]> {
    return await this.teamRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findByName(name: string): Promise<Team | null> {
    return await this.teamRepository.findOne({
      where: { name },
    });
  }

  async count(): Promise<number> {
    return await this.teamRepository.count();
  }

  async create(teamData: Omit<Team, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const team = this.teamRepository.create(teamData);
    return await this.teamRepository.save(team);
  }

  async update(id: string, updateData: Partial<Omit<Team, '_id' | 'id' | 'createdAt' | 'updatedAt'>>): Promise<Team | null> {
    try {
      const objectId = new ObjectId(id);

      const updateResult = await this.teamRepository.update({ _id: objectId } as any, { ...updateData, updatedAt: new Date() });

      if ((updateResult.affected ?? 0) === 0) {
        return null;
      }

      return await this.teamRepository.findOneBy({ _id: objectId } as any);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const deleteResult = await this.teamRepository.delete({ _id: objectId } as any);
      return (deleteResult.affected ?? 0) > 0;
    } catch {
      return false;
    }
  }

  async addMember(teamId: string, userId: string): Promise<Team | null> {
    try {
      const teamObjectId = new ObjectId(teamId);
      const userObjectId = new ObjectId(userId);

      const team = await this.teamRepository.findOneBy({ _id: teamObjectId } as any);
      if (!team) {
        return null;
      }

      // Check if user is already a member
      if (team.memberIds.some((id) => id.toString() === userId)) {
        return team; // Already a member, return current team
      }

      // Add user to members
      team.memberIds.push(userObjectId);
      team.updatedAt = new Date();

      return await this.teamRepository.save(team);
    } catch {
      return null;
    }
  }

  async removeMember(teamId: string, userId: string): Promise<Team | null> {
    try {
      const teamObjectId = new ObjectId(teamId);

      const team = await this.teamRepository.findOneBy({ _id: teamObjectId } as any);
      if (!team) {
        return null;
      }

      // Remove user from members
      team.memberIds = team.memberIds.filter((id) => id.toString() !== userId);
      team.updatedAt = new Date();

      return await this.teamRepository.save(team);
    } catch {
      return null;
    }
  }
}
