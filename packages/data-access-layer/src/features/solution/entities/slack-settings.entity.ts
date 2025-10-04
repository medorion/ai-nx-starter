import { Column } from 'typeorm';

export class SlackSettings {
  @Column()
  channelId: string;
}
