import { HttpException } from '@nestjs/common';
import { ErrorStatusCode } from '@medorion/types';

export class NotImplementedException extends HttpException {
  constructor(message = 'Not implemented') {
    super(message, ErrorStatusCode.NotImplemented);
  }
}