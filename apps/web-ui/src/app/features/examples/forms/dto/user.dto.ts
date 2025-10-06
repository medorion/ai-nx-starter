import {
  IsBoolean,
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsUrl,
} from "class-validator";

export class ClientUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string = "";

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  public password: string = "";

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  public checkPassword: string = "";

  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  public nickname: string = "";

  @IsString()
  @IsNotEmpty()
  public phoneNumberPrefix: string = "+86";

  @IsString()
  @IsNotEmpty()
  public phoneNumber: string = "";

  @IsUrl()
  @IsNotEmpty()
  public website: string = "";

  @IsString()
  @IsNotEmpty()
  public captcha: string = "";

  @IsBoolean()
  public agree: boolean = false;
}
