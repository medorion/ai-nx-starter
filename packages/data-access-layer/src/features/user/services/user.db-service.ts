import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class UserDbService {
  constructor(
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    try {
      const objectId = new ObjectId(id);
      return await this.userRepository.findOneBy({ _id: objectId } as any);
    } catch {
      return null;
    }
  }

  async findAll(limit = 50, offset = 0): Promise<User[]> {
    return await this.userRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }

  async create(userData: Omit<User, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async update(id: string, updateData: Partial<Omit<User, '_id' | 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    try {
      const objectId = new ObjectId(id);

      // Hash password if it's being updated
      const dataToUpdate = { ...updateData };
      if (dataToUpdate.password) {
        dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
      }

      const updateResult = await this.userRepository.update({ _id: objectId } as any, { ...dataToUpdate, updatedAt: new Date() });

      if ((updateResult.affected ?? 0) === 0) {
        return null;
      }

      return await this.userRepository.findOneBy({ _id: objectId } as any);
    } catch {
      return null;
    }
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['_id', 'firstName', 'lastName', 'role', 'email', 'password', 'phone', 'picture', 'createdAt', 'updatedAt'],
    });
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async delete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const deleteResult = await this.userRepository.delete({ _id: objectId } as any);
      return (deleteResult.affected ?? 0) > 0;
    } catch {
      return false;
    }
  }
}
