import { Column } from 'typeorm';

export class SmsSettings {
  @Column()
  accountId: string;

  @Column()
  accountKey: string;

  @Column()
  accountFromService: string;

  @Column()
  shortenUrls: boolean;
}
