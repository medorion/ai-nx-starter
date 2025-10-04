import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthMapperService } from './auth-mapper.service';
import { CommonServicesModule } from '../common-services.module';

@Global()
@Module({
  imports: [CommonServicesModule],
  controllers: [AuthController],
  providers: [AuthService, AuthMapperService],
  exports: [AuthService, AuthMapperService],
})
export class AuthModule {}
