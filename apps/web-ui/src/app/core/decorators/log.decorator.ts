import { LoggerService } from "../services/logger.service";
import { LogLevel } from "../services/log-level.enum";
import { CustomAngularContext } from "../custom-angular-context";

export function log(level: LogLevel, message: string): MethodDecorator {
  return function (
    _target: any,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const loggerService = CustomAngularContext.injector.get(LoggerService);
      // Call service first (or move after originalMethod if you want)
      switch (level) {
        case LogLevel.Debug:
          loggerService.debug(message, ...args);
          break;
        case LogLevel.Info:
          loggerService.info(message, ...args);
          break;
        case LogLevel.Warn:
          loggerService.warn(message, ...args);
          break;
        case LogLevel.Error:
          loggerService.error(message, ...args);
          break;
      }

      // Call the original method
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
