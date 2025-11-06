import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientUserDto } from '../features/users/client-user.dto';

export class UIAppContextDto {
  @ValidateNested()
  @Type(() => ClientUserDto)
  @IsOptional()
  public currentUser: ClientUserDto | null;
}
