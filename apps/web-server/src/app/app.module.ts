import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExampleModule } from './features/example/example.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './features/user/user.module';
import { DataAccessModule } from './data-access.module';
import { ExceptionsModule } from './features/exceptions/exceptions.module';
import { SyncEventsModule } from './features/sync-events/sync-events.module';
import { LoggerModule } from 'nestjs-pino';
import { AppInitializerService } from './app-initializer-service';
import { APP_GUARD } from '@nestjs/core';
import { AuthorizeGuard, CoreServicesModule } from '@ai-nx-starter/backend-common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes config available app-wide
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty', // human-readable logs in dev
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        level: process.env.LOG_LEVEL || 'info',
        autoLogging: false, // logs incoming requests automatically
        redact: ['req.headers.authorization'], // hide sensitive data
      },
    }),
    // Examples
    ExampleModule,
    // Common
    DataAccessModule,
    CoreServicesModule,
    AuthModule,
    ExceptionsModule,
    // Features
    UserModule,
    SyncEventsModule,
  ],
  controllers: [],
  providers: [
    AppInitializerService,
    {
      provide: APP_GUARD,
      useClass: AuthorizeGuard,
    },
  ],
})
export class AppModule {}
