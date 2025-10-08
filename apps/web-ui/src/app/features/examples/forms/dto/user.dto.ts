import { IsBoolean, IsEmail, IsString, MinLength, IsNotEmpty, IsUrl } from 'class-validator';

export class ClientUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email = '';

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  public password = '';

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  public checkPassword = '';

  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  public nickname = '';

  @IsString()
  @IsNotEmpty()
  public phoneNumberPrefix = '+86';

  @IsString()
  @IsNotEmpty()
  public phoneNumber = '';

  @IsUrl()
  @IsNotEmpty()
  public website = '';

  @IsString()
  @IsNotEmpty()
  public captcha = '';

  @IsBoolean()
  public agree = false;
}
