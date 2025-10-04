import { OrganizationStatus } from '../../../enums/features/organization-status.enum';
import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export class UpdateOrganizationDataDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsEnum(OrganizationStatus)
  @IsOptional()
  status?: OrganizationStatus;
}