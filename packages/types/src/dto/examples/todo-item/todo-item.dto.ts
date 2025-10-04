import { IsString, IsOptional, IsArray, IsNotEmpty, IsEnum, IsNumber, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SubItemDto } from './sub-item.dto';

enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export class TodoItemDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  public subItems: SubItemDto[];

  @IsEnum(TodoStatus)
  @IsNotEmpty()
  public status: 'pending' | 'in_progress' | 'completed' | 'archived';

  @IsNumber()
  @IsNotEmpty()
  public priority: number;

  @IsOptional()
  @IsDateString()
  public dueDate?: Date;

  @IsOptional()
  @IsString()
  public assignedTo?: string;

  @IsArray()
  @IsString({ each: true })
  public tags: string[];

  @IsDateString()
  @IsNotEmpty()
  public createdAt: Date;

  @IsDateString()
  @IsNotEmpty()
  public updatedAt: Date;
}
