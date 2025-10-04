import { ArrayNotEmpty, IsNotEmpty, ValidateNested } from 'class-validator';
import { IdCodeNameDto } from './id-code-name.dto';
import { IdNameDto } from './id-name.dto';
import { Type } from 'class-transformer';
import { UserDto } from '../features/users/user.dto';

export class UiAppContextDto {
  @ValidateNested()
  @Type(() => UserDto)
  @IsNotEmpty()
  public currentUser: UserDto;

  @ValidateNested()
  @Type(() => IdCodeNameDto)
  @IsNotEmpty()
  public currentOrg: IdCodeNameDto;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => IdCodeNameDto)
  public availableOrganizations: IdCodeNameDto[];

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => IdNameDto)
  public availableSolutions: IdNameDto[];
}
