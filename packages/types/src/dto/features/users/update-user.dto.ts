import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Role } from '../../../enums/core/role.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  public firstName?: string;

  @IsString()
  @IsOptional()
  public lastName?: string;

  @IsEnum(Role)
  @IsOptional()
  public role?: Role;

  @IsEmail()
  @IsOptional()
  public email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  public password?: string;

  @IsString()
  @IsOptional()
  public phone?: string;

  @IsString()
  @IsOptional()
  public picture?: string;
}
