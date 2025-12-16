import { IsString, IsNotEmpty, IsOptional, IsDate, IsArray, MinLength, MaxLength } from 'class-validator';
import { ClientUserDto } from '../users/client-user.dto';

export class ClientTeamDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  public name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  public description?: string;

  @IsString()
  @IsNotEmpty()
  public ownerId: string;

  @IsArray()
  @IsString({ each: true })
  public memberIds: string[];

  @IsOptional()
  public owner?: ClientUserDto;

  @IsOptional()
  @IsArray()
  public members?: ClientUserDto[];

  @IsDate()
  @IsOptional()
  public createdAt?: Date;

  @IsDate()
  @IsOptional()
  public updatedAt?: Date;
}
