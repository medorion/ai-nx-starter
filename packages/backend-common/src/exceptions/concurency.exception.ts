import { HttpException } from '@nestjs/common';
import { ErrorStatusCode } from '@medorion/types';

export class ConcurencyException extends HttpException {
  constructor(message: string | object | any) {
    super(message, ErrorStatusCode.ConcurencyException);
  }
}
