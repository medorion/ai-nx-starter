import { Column } from 'typeorm';

export class GoogleAnalyticsSettings {
  @Column()
  viewId: string;
}
