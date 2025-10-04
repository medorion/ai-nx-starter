import { IsString, IsOptional, IsObject, IsNotEmpty, IsUrl, IsIn } from 'class-validator';

export class LinkSubItemDto {
  @IsIn(['link'])
  @IsNotEmpty()
  public type: 'link';

  @IsUrl()
  @IsNotEmpty()
  public url: string;

  @IsOptional()
  @IsString()
  public title?: string;

  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
