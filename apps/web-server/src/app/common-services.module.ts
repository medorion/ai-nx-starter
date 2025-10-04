import { Module, Global } from '@nestjs/common';
import { Auth0Service, SessionService } from '@medorion/backend-common';

@Global()
@Module({
  imports: [],
  providers: [Auth0Service, SessionService],
  exports: [Auth0Service, SessionService],
})
export class CommonServicesModule {}