import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ServerToServerSessionInfoDto {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsString()
  orgCode: string;

  @IsString()
  orgSecret: string;

  @IsNumber()
  createdAt: number;

  @IsNumber()
  expiresAt: number;

  @IsString()
  serverVersion: string;
}
