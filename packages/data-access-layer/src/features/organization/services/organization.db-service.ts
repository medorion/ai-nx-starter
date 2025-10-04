import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Organization } from '../entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationStatus } from '@medorion/types';

@Injectable()
export class OrganizationDbService {
  constructor(@InjectRepository(Organization)
              private organizationRepository: MongoRepository<Organization>) {}

  async findById(id: string): Promise<Organization | null> {
    const objectId = new ObjectId(id);
    return await this.organizationRepository.findOne({ where: { _id: objectId } });
  }

  async findAll(limit = 50, offset = 0): Promise<Organization[]> {
    return await this.organizationRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: OrganizationStatus): Promise<Organization[]> {
    return await this.organizationRepository.find({
      where: { status },
      order: { name: 'ASC' },
    });
  }

  async findByName(name: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({
      where: { name },
    });
  }

  async findByCode(code: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({
      where: { code },
    });
  }

  async searchByName(namePattern: string): Promise<Organization[]> {
    return await this.organizationRepository.find({
      where: { name: { $regex: namePattern, $options: 'i' } },
      order: { name: 'ASC' },
    });
  }

  async create(orgData: Organization): Promise<Organization> {
    const organization = this.organizationRepository.create({
      ...orgData,
      status: orgData.status || OrganizationStatus.Active,
    });
    return await this.organizationRepository.save(organization);
  }

  async update(id: string, updateData: Partial<Organization>): Promise<Organization | null> {
    const objectId = new ObjectId(id);
    const updateResult = await this.organizationRepository.update(
      { _id: objectId },
      { ...updateData, updatedAt: new Date() }
    );

    if ((updateResult.affected ?? 0) === 0) {
      return null;
    }

    return await this.organizationRepository.findOne({ where: { _id: objectId } });
  }

  async updateStatus(id: string, status: OrganizationStatus): Promise<Organization | null> {
    const objectId = new ObjectId(id);
    const updateResult = await this.organizationRepository.update(
      { _id: objectId },
      { status, updatedAt: new Date() }
    );

    if ((updateResult.affected ?? 0) === 0) {
      return null;
    }

    return await this.organizationRepository.findOne({ where: { _id: objectId } });
  }

  async delete(id: string): Promise<boolean> {
    const objectId = new ObjectId(id);
    const result = await this.organizationRepository.delete({ _id: objectId });
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return await this.organizationRepository.count();
  }

  async countByStatus(status: OrganizationStatus): Promise<number> {
    return await this.organizationRepository.count({ where: { status } });
  }

  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    const query: any = { code };

    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const count = await this.organizationRepository.count({ where: query });
    return count === 0;
  }

  async isNameUnique(name: string, excludeId?: string): Promise<boolean> {
    const query: any = { name };

    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const count = await this.organizationRepository.count({ where: query });
    return count === 0;
  }
}