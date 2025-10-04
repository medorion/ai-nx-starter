import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class SyncServiceFlowSearchOptionsDto {
  @IsOptional()
  @IsString()
  flowId?: string;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  orgCode?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDate()
  createdAtFrom?: Date;

  @IsOptional()
  @IsDate()
  createdAtTo?: Date;

  @IsOptional()
  @IsBoolean()
  includeFlowDefinition?: boolean;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
