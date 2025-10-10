import { Module, Global } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { CryptoService } from './services/crypto.service';

@Global()
@Module({
  imports: [],
  providers: [SessionService, CryptoService],
  exports: [SessionService, CryptoService],
})
export class CoreServicesModule {}
