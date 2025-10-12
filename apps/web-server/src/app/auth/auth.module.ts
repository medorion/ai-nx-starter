import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthMapperService } from './auth-mapper.service';
import { CoreServicesModule } from '@ai-nx-starter/backend-common';
import { DataAccessModule } from '../data-access.module';

@Global()
@Module({
  imports: [CoreServicesModule, DataAccessModule],
  controllers: [AuthController],
  providers: [AuthService, AuthMapperService],
  exports: [AuthService, AuthMapperService],
})
export class AuthModule {}
