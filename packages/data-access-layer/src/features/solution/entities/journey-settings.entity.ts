import { Column } from 'typeorm';

export class JourneySettings {
  @Column()
  journeyRestartType: string;

  @Column()
  journeyRetentionDays: number;
}
