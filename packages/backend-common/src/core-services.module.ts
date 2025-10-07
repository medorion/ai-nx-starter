import { Module, Global } from "@nestjs/common";
import { Auth0Service } from "./services/auth0.service";
import { SessionService } from "./services/session.service";
import { ServerToServerAuthService } from "./services/server-to-server-auth.service";
import { CryptoService } from "./services/crypto.service";

@Global()
@Module({
  imports: [],
  providers: [
    Auth0Service,
    SessionService,
    CryptoService,
    ServerToServerAuthService,
  ],
  exports: [
    Auth0Service,
    SessionService,
    CryptoService,
    ServerToServerAuthService,
  ],
})
export class CoreServicesModule {}
