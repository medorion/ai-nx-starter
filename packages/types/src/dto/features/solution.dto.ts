import { IsString, IsOptional, IsNotEmpty, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class SolutionDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  orgCode: string;

  @IsNumber()
  @IsNotEmpty()
  appCode: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsArray()
  allowedUserIds: string[];

  @IsString()
  @IsNotEmpty()
  creationUserId: string;

  @IsNumber()
  @IsNotEmpty()
  lastUpdateTime: number;

  // channelSettings: any;
}
