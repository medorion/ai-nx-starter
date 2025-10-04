import { IsOptional, IsString, IsNotEmpty, MaxLength, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { CommunicationsSettingsDto } from '../../common/communication-settings/communication-settings.dto';
import { IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class SolutionDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  orgCode: string;

  @IsNumber()
  @IsNotEmpty()
  appCode: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsArray()
  @IsString()
  @IsNotEmpty()
  allowedUserIds: string[];

  @IsString()
  @IsNotEmpty()
  creationUserId: string;

  @Type(() => CommunicationsSettingsDto)
  @ValidateNested()
  defaultCommunicationSettings: CommunicationsSettingsDto;
}
