import { HttpException } from '@nestjs/common';
import { ErrorStatusCode } from '@ai-nx-starter/types';
export class UnauthorizedLoginException extends HttpException {
  constructor(message: string | object | any) {
    super(message, ErrorStatusCode.UnauthorizedLogin);
  }
}
