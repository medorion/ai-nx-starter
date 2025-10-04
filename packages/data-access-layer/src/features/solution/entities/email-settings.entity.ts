import { Column } from 'typeorm';

export class EmailParameters {
  @Column()
  fromEmail: string;

  @Column()
  fromName: string;
}

export class EmailSettings {
  @Column()
  accountName: string;

  @Column()
  accountKey: string;

  @Column()
  apiDomain: string;

  @Column(() => EmailParameters)
  emailParameters: EmailParameters;
}
