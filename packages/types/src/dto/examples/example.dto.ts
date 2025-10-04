import { IsNumber, Max, MaxLength, Min, MinLength, IsString, IsEmail, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class ExampleDto {
  @IsString()
  id: string = '';

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string = '';

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(120)
  age: number = 0;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  tags: string[] = [];
}
