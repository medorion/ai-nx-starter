import { HttpException } from '@nestjs/common';
import { ErrorStatusCode } from '@ai-nx-starter/types';

export class NotImplementedException extends HttpException {
  constructor(message = 'Not implemented') {
    super(message, ErrorStatusCode.NotImplemented);
  }
}
