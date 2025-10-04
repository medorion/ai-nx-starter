import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SubItemDto } from './sub-item.dto';

enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export class UpdateTodoItemDto {
  @IsOptional()
  @IsString()
  public title?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  public subItems?: SubItemDto[];

  @IsOptional()
  @IsEnum(TodoStatus)
  public status?: 'pending' | 'in_progress' | 'completed' | 'archived';

  @IsOptional()
  @IsNumber()
  public priority?: number;

  @IsOptional()
  @IsDateString()
  public dueDate?: Date;

  @IsOptional()
  @IsString()
  public assignedTo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public tags?: string[];
}
