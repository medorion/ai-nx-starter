import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CommunicationsSettings } from './communications-settings.entity';

/**
 * Solution Entity
 * Represents a solution/application in the system
 */
@Entity('solutions')
export class Solution {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ length: 15 })
  orgCode: string;

  @Column()
  appCode: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 255 })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'array', default: [] })
  allowedUserIds: string[];

  @Column()
  creationUserId: string;

  @Column(() => CommunicationsSettings)
  defaultCommunicationSettings: CommunicationsSettings;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get id(): string {
    return this._id.toString();
  }
}
