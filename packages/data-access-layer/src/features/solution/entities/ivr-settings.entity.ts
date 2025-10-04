import { Column } from 'typeorm';

export class IvrSettings {
  @Column()
  accountId: string;

  @Column()
  accountKey: string;

  @Column()
  fromNumber: string;

  @Column()
  enableMemberVerification: boolean;

  @Column()
  callAttempts: number;

  @Column()
  authenticationAttempts: number;

  @Column()
  timeout: number;

  @Column()
  authenticationFields: string[];
}
