import { IsNotEmpty, IsString } from 'class-validator';

export class ExternalLoginDto {
  @IsString()
  @IsNotEmpty()
  orgCode: string;
}
