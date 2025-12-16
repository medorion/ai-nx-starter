import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('teams')
export class Team {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: false })
  ownerId: ObjectId;

  @Column({ nullable: false, type: 'array', default: [] })
  memberIds: ObjectId[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get id(): string {
    return this._id.toString();
  }
}
