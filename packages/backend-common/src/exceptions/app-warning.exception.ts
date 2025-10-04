import { HttpException } from '@nestjs/common';
import { ErrorStatusCode } from '@medorion/types';

export class AppWarningException extends HttpException {
  constructor(message: string | object | any) {
    super(message, ErrorStatusCode.AppWarning);
  }
}
