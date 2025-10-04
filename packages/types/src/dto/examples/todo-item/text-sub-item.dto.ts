import { IsString, IsOptional, IsObject, IsNotEmpty, IsIn } from 'class-validator';

export class TextSubItemDto {
  @IsIn(['text'])
  @IsNotEmpty()
  public type: 'text';

  @IsString()
  @IsNotEmpty()
  public content: string;

  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
