import { IsString, IsEmail, IsOptional, IsNotEmpty, IsEnum, IsDate } from 'class-validator';
import { Role } from '../../../enums/core/role.enum';

export class ClientUserDto {
  @IsString()
  public id: string;

  @IsOptional()
  @IsString()
  public firstName: string;

  @IsOptional()
  @IsString()
  public lastName: string;

  @IsEnum(Role)
  @IsNotEmpty()
  public role: Role;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsOptional()
  public phone?: string;

  @IsString()
  @IsOptional()
  public picture?: string;

  @IsDate()
  @IsOptional()
  public createdAt?: Date;

  @IsDate()
  @IsOptional()
  public updatedAt?: Date;
}
