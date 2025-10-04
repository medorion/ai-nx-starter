import { IsString, IsEmail, IsOptional, IsArray, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '../../../enums/core/role.enum';

export class UserDto {
  @IsString()
  public id: string;

  @IsOptional()
  @IsString()
  public firstName?: string;

  @IsOptional()
  @IsString()
  public lastName?: string;

  @IsEnum(Role)
  @IsNotEmpty()
  public role: Role;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsOptional()
  public status?: string;

  @IsArray()
  @IsNotEmpty()
  public organizationCodes: string[];

  @IsString()
  @IsOptional()
  public login?: string;

  @IsString()
  @IsOptional()
  public mobilePhone?: string;

  @IsString()
  @IsOptional()
  public name?: string;
}
