import { IsArray, IsNumber } from 'class-validator';

export class QueryResultDto<T> {
  @IsArray()
  data: T[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsNumber()
  totalPages: number;
}
