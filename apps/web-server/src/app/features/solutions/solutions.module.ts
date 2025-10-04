import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solution, SolutionDbService } from '@medorion/data-access-layer';
import { SolutionsController } from './solutions.controller';
import { SolutionsService } from './solutions.service';
import { SolutionMapperService } from './solution-mapper.service';

@Module({
  imports: [TypeOrmModule.forFeature([Solution])],
  controllers: [SolutionsController],
  providers: [SolutionDbService, SolutionsService, SolutionMapperService],
  exports: [SolutionsService],
})
export class SolutionsModule {}
