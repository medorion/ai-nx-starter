export class EmailParametersDto {
  public fromEmail: string;
  public fromName: string;
}

export class EmailSettingsDto {
  public accountName: string;
  public accountKey: string;
  public apiDomain: string;
  public emailParameters: EmailParametersDto;
}
