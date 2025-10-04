import { Module } from '@nestjs/common';
import { ExceptionsController } from './exceptions.controller';

/**
 * Exceptions module for testing and demonstrating error handling
 * This module provides endpoints to trigger different types of exceptions
 * for testing the error handling system across the application
 */
@Module({
  controllers: [ExceptionsController],
  providers: [],
  exports: [],
})
export class ExceptionsModule {}