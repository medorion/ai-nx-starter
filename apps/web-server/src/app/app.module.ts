import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExampleModule } from './examples/example/example.module';
import { AuthModule } from './auth/auth.module';
import { TodoItemModule } from './examples/todo-item/todo-item.module';
import { DataAccessModule } from './data-access.module';
import { ExceptionsModule } from './examples/exceptions/exceptions.module';
import { OrganizationsModule } from './features/organizations/organizations.module';
import { UsersModule } from './features/users/users.module';
import { SolutionsModule } from './features/solutions/solutions.module';
import { SyncServiceFlowModule } from './features/sync-service-flow/sync-service-flow.module';
import { LoggerModule } from 'nestjs-pino';
import { AppInitializerService } from './app-initializer-service';
import { APP_GUARD } from '@nestjs/core';
import { Auth0AuthorizeGuard, CoreServicesModule } from '@medorion/backend-common';

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
    TodoItemModule,
    // Common
    DataAccessModule,
    CoreServicesModule,
    AuthModule,
    ExceptionsModule,
    // Features
    OrganizationsModule,
    UsersModule,
    SolutionsModule,
    SyncServiceFlowModule,
  ],
  controllers: [],
  providers: [
    AppInitializerService,
    {
      provide: APP_GUARD,
      useClass: Auth0AuthorizeGuard,
    },
  ],
})
export class AppModule {}
