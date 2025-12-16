import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  public name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  public description?: string;
}
