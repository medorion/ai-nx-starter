import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error-handler';
import { LoggerService } from '../services/logger.service';

describe('GlobalErrorHandler', () => {
  let errorHandler: GlobalErrorHandler;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    const mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler, { provide: LoggerService, useValue: mockLogger }],
    });

    errorHandler = TestBed.inject(GlobalErrorHandler);
    logger = TestBed.inject(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should create the error handler', () => {
      expect(errorHandler).toBeTruthy();
    });

    it('should implement ErrorHandler interface', () => {
      expect(errorHandler.handleError).toBeDefined();
      expect(typeof errorHandler.handleError).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should log error with logger', () => {
      const error = new Error('Test error');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle Error objects', () => {
      const error = new Error('Something went wrong');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle TypeError', () => {
      const error = new TypeError('Cannot read property of undefined');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle ReferenceError', () => {
      const error = new ReferenceError('Variable is not defined');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle string errors', () => {
      const error = 'String error message';

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle number errors', () => {
      const error = 404;

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle null errors', () => {
      const error = null;

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle undefined errors', () => {
      const error = undefined;

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle custom error objects', () => {
      const error = {
        code: 'CUSTOM_ERROR',
        message: 'Custom error occurred',
        details: { userId: '123' },
      };

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle errors with stack traces', () => {
      const error = new Error('Error with stack');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
      expect(logger.error.mock.calls[0][1]).toHaveProperty('stack');
    });
  });

  describe('Error Types', () => {
    it('should handle RangeError', () => {
      const error = new RangeError('Invalid array length');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle SyntaxError', () => {
      try {
        eval('invalid javascript {');
      } catch (error) {
        errorHandler.handleError(error);
        expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
      }
    });

    it('should handle EvalError', () => {
      const error = new EvalError('Eval error');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle URIError', () => {
      try {
        decodeURIComponent('%');
      } catch (error) {
        errorHandler.handleError(error);
        expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
      }
    });
  });

  describe('Multiple Error Handling', () => {
    it('should handle multiple errors in sequence', () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');
      const error3 = new Error('Third error');

      errorHandler.handleError(error1);
      errorHandler.handleError(error2);
      errorHandler.handleError(error3);

      expect(logger.error).toHaveBeenCalledTimes(3);
      expect(logger.error).toHaveBeenNthCalledWith(1, 'Unhandled error', error1);
      expect(logger.error).toHaveBeenNthCalledWith(2, 'Unhandled error', error2);
      expect(logger.error).toHaveBeenNthCalledWith(3, 'Unhandled error', error3);
    });

    it('should handle same error multiple times', () => {
      const error = new Error('Repeated error');

      errorHandler.handleError(error);
      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('Complex Error Scenarios', () => {
    it('should handle errors with nested objects', () => {
      const error = {
        message: 'Complex error',
        data: {
          user: { id: '123', name: 'John' },
          context: { route: '/dashboard', action: 'load' },
        },
      };

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle errors with circular references', () => {
      const error: any = { message: 'Circular error' };
      error.self = error;

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle errors with arrays', () => {
      const error = {
        message: 'Multiple errors',
        errors: ['Error 1', 'Error 2', 'Error 3'],
      };

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle large error objects', () => {
      const error = {
        message: 'Large error',
        data: new Array(1000).fill({ key: 'value' }),
      };

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Error Handler Behavior', () => {
    it('should not throw when handling errors', () => {
      const error = new Error('Test error');

      expect(() => {
        errorHandler.handleError(error);
      }).not.toThrow();
    });

    it('should call logger exactly once per error', () => {
      const error = new Error('Test');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should always log with "Unhandled error" prefix', () => {
      const error = new Error('Test');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Unhandled error'), expect.anything());
    });

    it('should pass the full error to logger', () => {
      const error = new Error('Test error');
      error.name = 'CustomError';

      errorHandler.handleError(error);

      const loggedError = logger.error.mock.calls[0][1];
      expect(loggedError).toBe(error);
      expect(loggedError.name).toBe('CustomError');
    });
  });

  describe('Angular Integration', () => {
    it('should be injectable', () => {
      const injectedHandler = TestBed.inject(GlobalErrorHandler);
      expect(injectedHandler).toBeInstanceOf(GlobalErrorHandler);
    });

    it('should inject LoggerService', () => {
      const injectedLogger = TestBed.inject(LoggerService);
      expect(injectedLogger).toBeDefined();
    });

    it('should work with dependency injection', () => {
      const error = new Error('DI test');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty error object', () => {
      const error = {};

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle boolean errors', () => {
      errorHandler.handleError(false);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', false);
    });

    it('should handle function errors', () => {
      const error = function testError() {
        return 'error';
      };

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle symbol errors', () => {
      const error = Symbol('error');

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });

    it('should handle BigInt errors', () => {
      const error = BigInt(12345);

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });
  });

  describe('Error Messages', () => {
    it('should preserve error message', () => {
      const message = 'Specific error message';
      const error = new Error(message);

      errorHandler.handleError(error);

      const loggedError = logger.error.mock.calls[0][1];
      expect(loggedError.message).toBe(message);
    });

    it('should handle error without message', () => {
      const error = new Error();

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle errors with very long messages', () => {
      const longMessage = 'x'.repeat(10000);
      const error = new Error(longMessage);

      errorHandler.handleError(error);

      expect(logger.error).toHaveBeenCalledWith('Unhandled error', error);
    });
  });
});
