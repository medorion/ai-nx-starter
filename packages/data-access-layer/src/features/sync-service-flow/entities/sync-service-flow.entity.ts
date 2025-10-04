import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, Index } from 'typeorm';

@Entity('syncServiceFlows')
@Index(['flowId'])
@Index(['messageId'])
@Index(['orgCode'])
@Index(['status'])
@Index(['createdAt'])
export class SyncServiceFlow {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  flowId: string;

  @Column()
  messageId: string;

  @Column()
  orgCode: string;

  @Column({ nullable: true })
  snapshot?: number;

  @Column()
  startTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  endTime?: number;

  @Column()
  status: string;

  @Column({ nullable: true })
  flowDefinition?: string;

  @Column({ type: 'array', default: [] })
  errors: string[];

  @Column({ nullable: true })
  runBy?: string;

  @Column()
  externalId: string;

  @Column({ type: 'json', nullable: true })
  output?: { [key: string]: any };

  get id(): string {
    return this._id.toString();
  }
}
