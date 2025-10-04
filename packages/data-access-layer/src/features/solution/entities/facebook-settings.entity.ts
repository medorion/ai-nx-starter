import { Column } from 'typeorm';

export class FacebookSettings {
  @Column()
  adAccountId: string;
}
