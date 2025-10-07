import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsNotEmpty,
  IsEnum,
} from "class-validator";
import { Role } from "../../../enums/core/role.enum";

export class Auth0UserDto {
  @IsString()
  public id: string;

  @IsOptional()
  @IsString()
  public displayName?: string;

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
  public organizationCode?: string;

  @IsArray()
  @IsNotEmpty()
  public availableOrganizations: string[];

  @IsString()
  @IsOptional()
  public picture?: string;
}
