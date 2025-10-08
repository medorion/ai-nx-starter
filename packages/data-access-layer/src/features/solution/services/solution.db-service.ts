import { MongoRepository, ObjectId } from 'typeorm';
import { Solution } from '../entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SolutionDbService {
  constructor(
    @InjectRepository(Solution)
    private solutionRepository: MongoRepository<Solution>,
  ) {}

  /**
   * Find a solution by its ID
   * @param id - Solution ID
   * @returns Solution or null if not found
   */
  async findById(id: string): Promise<Solution | null> {
    try {
      const objectId = new ObjectId(id);
      return await this.solutionRepository.findOne({ where: { _id: objectId } });
    } catch (error) {
      return null;
    }
  }

  /**
   * Find all solutions with pagination
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Array of solutions
   */
  async findAll(limit = 50, offset = 0): Promise<Solution[]> {
    return await this.solutionRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find solutions by organization code
   * @param orgCode - Organization code
   * @returns Array of solutions for the organization
   */
  async findByOrgCode(orgCode: string): Promise<Solution[]> {
    return await this.solutionRepository.find({
      where: { orgCode },
      order: { name: 'ASC' },
    });
  }

  /**
   * Find active solutions by organization code
   * @param orgCode - Organization code
   * @returns Array of active solutions
   */
  async findActiveByOrgCode(orgCode: string): Promise<Solution[]> {
    return await this.solutionRepository.find({
      where: { orgCode, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Find a solution by app code
   * @param appCode - Application code
   * @returns Solution or null if not found
   */
  async findByAppCode(appCode: number): Promise<Solution | null> {
    return await this.solutionRepository.findOne({
      where: { appCode },
    });
  }

  /**
   * Find solutions by organization code and app code
   * @param orgCode - Organization code
   * @param appCode - Application code
   * @returns Solution or null if not found
   */
  async findByOrgCodeAndAppCode(orgCode: string, appCode: number): Promise<Solution | null> {
    return await this.solutionRepository.findOne({
      where: { orgCode, appCode },
    });
  }

  /**
   * Find solutions accessible by a user
   * @param userId - User ID
   * @returns Array of solutions the user has access to
   */
  async findByUserId(userId: string): Promise<Solution[]> {
    return await this.solutionRepository.find({
      where: { allowedUserIds: { $in: [userId] } },
      order: { name: 'ASC' },
    });
  }

  /**
   * Find active solutions accessible by a user
   * @param userId - User ID
   * @returns Array of active solutions the user has access to
   */
  async findActiveByUserId(userId: string): Promise<Solution[]> {
    return await this.solutionRepository.find({
      where: {
        allowedUserIds: { $in: [userId] },
        isActive: true,
      },
      order: { name: 'ASC' },
    });
  }

  /**
   * Create a new solution
   * @param solutionData - Solution data
   * @returns Created solution
   */
  async create(solutionData: Omit<Solution, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Solution> {
    const solution = this.solutionRepository.create({
      ...solutionData,
      isActive: solutionData.isActive ?? true,
      allowedUserIds: solutionData.allowedUserIds || [],
    });
    return await this.solutionRepository.save(solution);
  }

  /**
   * Update an existing solution
   * @param id - Solution ID
   * @param updateData - Partial solution data to update
   * @returns Updated solution or null if not found
   */
  async update(id: string, updateData: Partial<Solution>): Promise<Solution | null> {
    try {
      const objectId = new ObjectId(id);
      const updateResult = await this.solutionRepository.update({ _id: objectId }, { ...updateData, updatedAt: new Date() });

      if ((updateResult.affected ?? 0) === 0) {
        return null;
      }

      return await this.solutionRepository.findOne({ where: { _id: objectId } });
    } catch (error) {
      return null;
    }
  }

  /**
   * Add a user to the allowed users list
   * @param id - Solution ID
   * @param userId - User ID to add
   * @returns Updated solution or null if not found
   */
  async addAllowedUser(id: string, userId: string): Promise<Solution | null> {
    try {
      const objectId = new ObjectId(id);
      const solution = await this.solutionRepository.findOne({ where: { _id: objectId } });

      if (!solution) {
        return null;
      }

      if (!solution.allowedUserIds.includes(userId)) {
        solution.allowedUserIds.push(userId);
        return await this.solutionRepository.save(solution);
      }

      return solution;
    } catch (error) {
      return null;
    }
  }

  /**
   * Remove a user from the allowed users list
   * @param id - Solution ID
   * @param userId - User ID to remove
   * @returns Updated solution or null if not found
   */
  async removeAllowedUser(id: string, userId: string): Promise<Solution | null> {
    try {
      const objectId = new ObjectId(id);
      const solution = await this.solutionRepository.findOne({ where: { _id: objectId } });

      if (!solution) {
        return null;
      }

      const index = solution.allowedUserIds.indexOf(userId);
      if (index > -1) {
        solution.allowedUserIds.splice(index, 1);
        return await this.solutionRepository.save(solution);
      }

      return solution;
    } catch (error) {
      return null;
    }
  }

  /**
   * Toggle solution active status
   * @param id - Solution ID
   * @param isActive - New active status
   * @returns Updated solution or null if not found
   */
  async setActiveStatus(id: string, isActive: boolean): Promise<Solution | null> {
    try {
      const objectId = new ObjectId(id);
      const updateResult = await this.solutionRepository.update({ _id: objectId }, { isActive, updatedAt: new Date() });

      if ((updateResult.affected ?? 0) === 0) {
        return null;
      }

      return await this.solutionRepository.findOne({ where: { _id: objectId } });
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete a solution
   * @param id - Solution ID
   * @returns True if deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const result = await this.solutionRepository.delete({ _id: objectId });
      return (result.affected ?? 0) > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Count total solutions
   * @returns Total number of solutions
   */
  async count(): Promise<number> {
    return await this.solutionRepository.count();
  }

  /**
   * Count solutions by organization code
   * @param orgCode - Organization code
   * @returns Number of solutions for the organization
   */
  async countByOrgCode(orgCode: string): Promise<number> {
    return await this.solutionRepository.count({ where: { orgCode } });
  }

  /**
   * Count active solutions
   * @returns Number of active solutions
   */
  async countActive(): Promise<number> {
    return await this.solutionRepository.count({ where: { isActive: true } });
  }

  /**
   * Check if a solution exists by app code
   * @param appCode - Application code
   * @returns True if exists, false otherwise
   */
  async existsByAppCode(appCode: number): Promise<boolean> {
    const count = await this.solutionRepository.count({ where: { appCode } });
    return count > 0;
  }

  /**
   * Check if a solution exists by org code and app code
   * @param orgCode - Organization code
   * @param appCode - Application code
   * @returns True if exists, false otherwise
   */
  async existsByOrgCodeAndAppCode(orgCode: string, appCode: number): Promise<boolean> {
    const count = await this.solutionRepository.count({ where: { orgCode, appCode } });
    return count > 0;
  }
}
