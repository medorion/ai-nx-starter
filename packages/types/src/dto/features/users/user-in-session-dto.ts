import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserInSessionDto {
  @IsString()
  @IsNotEmpty()
  public fullName: string;

  @IsString()
  @IsNotEmpty()
  public email: string;

  @IsOptional()
  public ip: string;

  @IsString()
  @IsNotEmpty()
  public organization: string;
}
