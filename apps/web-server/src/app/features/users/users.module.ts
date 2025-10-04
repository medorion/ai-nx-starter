import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserMapperService } from './user-mapper.service';

@Module({
  imports: [],
  exports: [UsersService],
  providers: [UsersService, UserMapperService],
  controllers: [UsersController],
})
export class UsersModule {}
