import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TodoItem, TodoItemDbService, User, UserDbService } from '@ai-nx-starter/data-access-layer';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGO_URI'),
        entities: [TodoItem, User],
        synchronize: true,
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    TypeOrmModule.forFeature([TodoItem, User]),
  ],
  providers: [TodoItemDbService, UserDbService],
  exports: [TodoItemDbService, UserDbService],
})
export class DataAccessModule {}
