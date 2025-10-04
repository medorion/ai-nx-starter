import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SubItem } from './sub-item.type';

@Entity('todo_items')
export class TodoItem {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  subItems: SubItem[];

  @Column({ default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'archived';

  @Column({ default: 0 })
  priority: number;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  assignedTo?: string;

  @Column({ default: [] })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get id(): string {
    return this._id.toString();
  }
}
