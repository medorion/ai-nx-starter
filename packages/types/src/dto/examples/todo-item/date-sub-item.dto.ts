import { IsString, IsOptional, IsObject, IsNotEmpty, IsDateString, IsIn } from 'class-validator';

export class DateSubItemDto {
  @IsIn(['date'])
  @IsNotEmpty()
  public type: 'date';

  @IsDateString()
  @IsNotEmpty()
  public date: Date;

  @IsOptional()
  @IsString()
  public timezone?: string;

  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
