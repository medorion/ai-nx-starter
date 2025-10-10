import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserMapper } from './user.mapper';
import { DataAccessModule } from '../../data-access.module';

@Module({
  imports: [DataAccessModule],
  controllers: [UserController],
  providers: [UserService, UserMapper],
  exports: [UserService, UserMapper],
})
export class UserModule {}
