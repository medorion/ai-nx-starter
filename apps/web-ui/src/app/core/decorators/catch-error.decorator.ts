import { LoggerService } from '../services/logger.service';
import { CustomAngularContext } from '../custom-angular-context';
import { NotificationService } from '../services/notification.service';

export interface CatchErrorOptions {
  display?: boolean; // Show notification to user (default: true)
  rethrow?: boolean; // Rethrow error (default: true)
  message?: string; // Custom user-facing message
}

/**
 * Decorator to catch errors in methods.
 * @param options - Options for error handling.
 * Example:
 * @catchError({ display: false, message: 'Something went wrong' })
 */
export function catchError(options: CatchErrorOptions = {}): MethodDecorator {
  const { display = true, rethrow = true, message } = options;

  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const logger = CustomAngularContext.injector.get(LoggerService);
      const notifier = CustomAngularContext.injector.get(NotificationService);

      try {
        return await originalMethod.apply(this, args);
      } catch (error: any) {
        // 1. Log internally
        logger.error(`Error in ${String(propertyKey)}`, error);

        // 2. Notify user if enabled
        if (display) {
          // TODO Combine message and error
          notifier.error(message ?? `${error}`);
        }

        // 3. Rethrow if enabled
        if (rethrow) {
          throw error;
        }

        return null; // If not rethrown, return safe fallback
      }
    };

    return descriptor;
  };
}
