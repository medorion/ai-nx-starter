import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TeamMapper } from './team.mapper';
import { DataAccessModule } from '../../data-access.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DataAccessModule, UserModule],
  controllers: [TeamController],
  providers: [TeamService, TeamMapper],
  exports: [TeamService, TeamMapper],
})
export class TeamModule {}
