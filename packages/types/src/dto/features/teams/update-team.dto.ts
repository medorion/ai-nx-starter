import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  public name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  public description?: string;
}
