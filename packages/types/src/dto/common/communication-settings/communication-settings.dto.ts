import { SlackSettingsDto } from "./slack-settings.dto";
import { EmailSettingsDto } from "./email-settings.dto";
import { SmsSettingsDto } from "./sms-settings.dto";
import { IvrSettingsDto } from "./ivr-settings.dto";
import { JourneySettingsDto } from "./journey-settings.dto";
import { ExternalBucketSettingsDto } from "./external-bucket-settings.dto";
import { GoogleAnalyticsSettingsDto } from "./google-analytics-settings.dto";
import { FacebookSettingsDto } from "./facebook-settings.dto";

export class CommunicationsSettingsDto {

    public googleAnalytics: GoogleAnalyticsSettingsDto;
  
    public facebook: FacebookSettingsDto;
  
    public email: EmailSettingsDto;
  
    public sms: SmsSettingsDto;
  
    public ivr: IvrSettingsDto;
  
    public slack: SlackSettingsDto;
  
    public journeySettings: JourneySettingsDto;
  
    public externalBucketSettings: ExternalBucketSettingsDto;
  }