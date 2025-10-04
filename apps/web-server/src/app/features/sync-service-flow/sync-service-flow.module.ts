import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncServiceFlow, SyncServiceFlowDbService } from '@medorion/data-access-layer';
import { SyncServiceFlowController } from './sync-service-flow.controller';
import { SyncServiceFlowService } from './sync-service-flow.service';
import { SyncServiceFlowMapperService } from './sync-service-flow-mapper.service';

@Module({
  imports: [TypeOrmModule.forFeature([SyncServiceFlow])],
  controllers: [SyncServiceFlowController],
  providers: [SyncServiceFlowDbService, SyncServiceFlowService, SyncServiceFlowMapperService],
  exports: [SyncServiceFlowService],
})
export class SyncServiceFlowModule {}
