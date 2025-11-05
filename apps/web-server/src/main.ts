/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// Polyfill for crypto global (required by @nestjs/typeorm in older Node versions)
import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { API_PREFIX } from '@ai-nx-starter/types';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Enforce validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown props
      forbidNonWhitelisted: true, // throws on unknown props
      transform: true, // auto-transforms payloads to DTO classes
    }),
  );
  const globalPrefix = `/${API_PREFIX}`;
  app.setGlobalPrefix(globalPrefix, {
    exclude: ['health'],
  });

  // Register the global exception filter
  // app.useGlobalFilters(new AllExceptionsFilter());

  // Attach pino logger
  app.useLogger(app.get(Logger));

  app.enableCors();
  const port = process.env.PORT || 3030;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
