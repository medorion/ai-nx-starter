import { Column } from 'typeorm';

export class ExternalBucketSettings {
  @Column()
  externalBucketCustomerService: string;

  @Column()
  externalBucketDecisionModelData: string;
}
