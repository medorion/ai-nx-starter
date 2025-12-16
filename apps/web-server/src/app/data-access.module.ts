import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TodoItem, TodoItemDbService, User, UserDbService, Team, TeamDbService } from '@ai-nx-starter/data-access-layer';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGO_URI'),
        entities: [TodoItem, User, Team],
        synchronize: true,
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    TypeOrmModule.forFeature([TodoItem, User, Team]),
  ],
  providers: [TodoItemDbService, UserDbService, TeamDbService],
  exports: [TodoItemDbService, UserDbService, TeamDbService],
})
export class DataAccessModule {}
