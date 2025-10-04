export class IvrSettingsDto {
  public accountId: string;
  public accountKey: string;
  public fromNumber: string;
  public enableMemberVerification: boolean;
  public callAttempts: number;
  public authenticationAttempts: number;
  public timeout: number;
  public authenticationFields: string[];
}
