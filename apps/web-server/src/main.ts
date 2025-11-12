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
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Enable security headers with helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Angular Material/NG-ZORRO
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for development compatibility
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  app.enableCors();

  // Configure Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('AI-Nx-Starter API')
    .setDescription('Auto-generated API documentation for AI-Nx-Starter monorepo')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your Bearer token from /auth/login',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Authentication', 'User authentication and session management')
    .addTag('Users', 'User management endpoints')
    .addTag('Examples', 'Example CRUD operations')
    .addTag('Events', 'Server-Sent Events (SSE) for real-time updates')
    .addTag('Health', 'Health check endpoints')
    .addTag('Exceptions', 'Demo endpoints for custom error handling')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AI-Nx-Starter API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3030;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  logger.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
