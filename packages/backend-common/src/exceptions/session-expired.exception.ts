import { HttpException } from '@nestjs/common';
import { ErrorStatusCode } from '@medorion/types';

export class SessionExpiredException extends HttpException {
  constructor(message: string | object | any) {
    super(message, ErrorStatusCode.SessionExpired);
  }
}
