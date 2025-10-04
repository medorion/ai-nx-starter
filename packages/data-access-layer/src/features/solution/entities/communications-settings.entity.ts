import { Column } from 'typeorm';
import { GoogleAnalyticsSettings } from './google-analytics-settings.entity';
import { FacebookSettings } from './facebook-settings.entity';
import { EmailSettings } from './email-settings.entity';
import { SmsSettings } from './sms-settings.entity';
import { IvrSettings } from './ivr-settings.entity';
import { SlackSettings } from './slack-settings.entity';
import { JourneySettings } from './journey-settings.entity';
import { ExternalBucketSettings } from './external-bucket-settings.entity';

export class CommunicationsSettings {
  @Column(() => GoogleAnalyticsSettings)
  googleAnalytics: GoogleAnalyticsSettings;

  @Column(() => FacebookSettings)
  facebook: FacebookSettings;

  @Column(() => EmailSettings)
  email: EmailSettings;

  @Column(() => SmsSettings)
  sms: SmsSettings;

  @Column(() => IvrSettings)
  ivr: IvrSettings;

  @Column(() => SlackSettings)
  slack: SlackSettings;

  @Column(() => JourneySettings)
  journeySettings: JourneySettings;

  @Column(() => ExternalBucketSettings)
  externalBucketSettings: ExternalBucketSettings;
}
