import { Injectable } from '@angular/core';
import { LogLevel } from './log-level.enum';
import { environment } from '../../../environments/environment';

/**
 * Logger service
 * Provides logging functionality with different log levels
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private level = environment.logLevel;

  public debug(message: string, ...args: any[]) {
    if (this.level >= LogLevel.Debug) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]) {
    if (this.level >= LogLevel.Info) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]) {
    if (this.level >= LogLevel.Warn) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: any[]) {
    if (this.level >= LogLevel.Error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}
