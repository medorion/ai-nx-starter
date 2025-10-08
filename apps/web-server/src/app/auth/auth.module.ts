import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthMapperService } from './auth-mapper.service';
import { CoreServicesModule } from '@medorion/backend-common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationDbService, Solution, SolutionDbService } from '@medorion/data-access-layer';
import { Organization } from '@medorion/data-access-layer';

@Global()
@Module({
  imports: [CoreServicesModule, TypeOrmModule.forFeature([Organization, Solution])],
  controllers: [AuthController],
  providers: [AuthService, AuthMapperService, SolutionDbService, OrganizationDbService],
  exports: [AuthService, AuthMapperService],
})
export class AuthModule {}
