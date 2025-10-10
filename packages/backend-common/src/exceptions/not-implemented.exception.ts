import { HttpException } from '@nestjs/common';
import { ErrorStatusCode } from '@monorepo-kit/types';

export class NotImplementedException extends HttpException {
  constructor(message = 'Not implemented') {
    super(message, ErrorStatusCode.NotImplemented);
  }
}
