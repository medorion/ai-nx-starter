import { CustomAngularContext } from '../custom-angular-context';
import { LoggerService } from '../services/logger.service';
import { LogLevel } from '../services/log-level.enum';

export function measureTime(logLevel: LogLevel, label?: string): MethodDecorator {
  return function (_target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Logger must  be injected only inside the decorator
      const loggerService = CustomAngularContext.injector.get(LoggerService);
      function logMessage(message: string) {
        switch (logLevel) {
          case LogLevel.Debug:
            loggerService.debug(message);
            break;
          case LogLevel.Info:
            loggerService.info(message);
            break;
          case LogLevel.Warn:
            loggerService.warn(message);
            break;
          case LogLevel.Error:
            loggerService.error(message);
            break;
        }
      }
      const start = performance.now();

      const result = originalMethod.apply(this, args);

      // Handle async methods (Promise)
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start;
          logMessage(`[measureTime] ${label || String(propertyKey)} took ${duration.toFixed(2)} ms`);
        });
      }

      // Sync methods
      const duration = performance.now() - start;
      logMessage(`[measureTime] ${label || String(propertyKey)} took ${duration.toFixed(2)} ms`);

      return result;
    };

    return descriptor;
  };
}
