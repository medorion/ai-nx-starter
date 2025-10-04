import { OrganizationStatus } from '../../../enums/features/organization-status.enum';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId, MaxLength } from 'class-validator';

export class OrganizationDto {
  
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  code: string;

  @IsEnum(OrganizationStatus)
  @IsNotEmpty()
  status: OrganizationStatus;
}
