import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FlowStatus } from '../../../enums/features/flow-status.enum';

export class SyncServiceFlowDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  flowId: string;

  @IsNotEmpty()
  @IsString()
  messageId: string;

  @IsNotEmpty()
  @IsString()
  orgCode: string;

  @IsOptional()
  @IsNumber()
  snapshot?: number;

  @IsNotEmpty()
  @IsNumber()
  startTime: number;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNumber()
  @IsOptional()
  endTime?: number;

  @IsEnum(FlowStatus)
  status: FlowStatus;

  // When flow is completed, this field contains the flow definition
  @IsOptional()
  flowDefinition?: string;

  @IsOptional()
  errors?: string[];

  @IsOptional()
  runBy?: string;

  @IsNotEmpty()
  @IsString()
  externalId: string;

  @IsOptional()
  output?: { [key: string]: any };
}
