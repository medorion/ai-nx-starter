import { IsString, IsOptional, IsObject, IsNotEmpty, IsArray, IsBoolean, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsNotEmpty()
  public text: string;

  @IsBoolean()
  @IsNotEmpty()
  public completed: boolean;
}

export class ChecklistSubItemDto {
  @IsIn(['checklist'])
  @IsNotEmpty()
  public type: 'checklist';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  @IsNotEmpty()
  public items: ChecklistItemDto[];

  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
