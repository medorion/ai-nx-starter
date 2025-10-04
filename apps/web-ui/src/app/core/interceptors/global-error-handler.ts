import { ErrorHandler, Injectable } from '@angular/core';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private logger: LoggerService) {}

  handleError(error: any): void {
    this.logger.error('Unhandled error', error);
    // Optionally report to backend/Sentry
  }
}
