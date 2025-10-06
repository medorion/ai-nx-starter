import { Role } from "../../../enums/core/role.enum";
import { IdCodeNameDto } from "../../common/id-code-name.dto";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

export class SessionUserDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsNotEmpty()
  public displayName: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public organization: string;

  @IsString()
  @IsNotEmpty()
  public organizationCode: string;

  @IsString()
  @IsNotEmpty()
  public token: string;

  @IsEnum(Role)
  @IsNotEmpty()
  public role: Role;

  @Type(() => IdCodeNameDto)
  @ValidateNested()
  public availableOrganizations: IdCodeNameDto[];

  @IsString()
  @IsNotEmpty()
  public serverVersion: string;

  @IsNumber()
  @IsNotEmpty()
  public lastLoginTime: number;
}
