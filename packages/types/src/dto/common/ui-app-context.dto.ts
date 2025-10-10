import { ArrayNotEmpty, IsNotEmpty, ValidateNested } from 'class-validator';
import { IdCodeNameDto } from './id-code-name.dto';
import { IdNameDto } from './id-name.dto';
import { Type } from 'class-transformer';
import { ClientUserDto } from '../features/users/client-user.dto';

export class UIAppContextDto {
  @ValidateNested()
  @Type(() => ClientUserDto)
  @IsNotEmpty()
  public currentUser: ClientUserDto;
}
