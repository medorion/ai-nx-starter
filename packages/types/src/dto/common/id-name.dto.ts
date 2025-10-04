import { IsNotEmpty, IsString } from 'class-validator';

export class IdNameDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
