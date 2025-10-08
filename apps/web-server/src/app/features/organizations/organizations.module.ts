import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization, OrganizationDbService } from '@medorion/data-access-layer';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationMapperService } from './organization-mapper.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationsController],
  providers: [OrganizationDbService, OrganizationsService, OrganizationMapperService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
