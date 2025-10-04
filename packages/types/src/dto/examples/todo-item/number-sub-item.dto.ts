import { IsString, IsOptional, IsObject, IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export class NumberSubItemDto {
  @IsIn(['number'])
  @IsNotEmpty()
  public type: 'number';

  @IsNumber()
  @IsNotEmpty()
  public value: number;

  @IsOptional()
  @IsString()
  public unit?: string;

  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
