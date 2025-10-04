import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TodoItem, TodoItemDbService } from '@medorion/data-access-layer';
import { Organization, OrganizationDbService } from '@medorion/data-access-layer';
import { Solution, SolutionDbService } from '@medorion/data-access-layer';
import { SyncServiceFlow, SyncServiceFlowDbService } from '@medorion/data-access-layer';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGO_URI'),
        entities: [TodoItem, Organization, Solution, SyncServiceFlow],
        synchronize: true,
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    TypeOrmModule.forFeature([TodoItem, Organization, Solution, SyncServiceFlow]),
  ],
  providers: [TodoItemDbService, OrganizationDbService, SolutionDbService, SyncServiceFlowDbService],
  exports: [TodoItemDbService, OrganizationDbService, SolutionDbService, SyncServiceFlowDbService],
})
export class DataAccessModule {}
