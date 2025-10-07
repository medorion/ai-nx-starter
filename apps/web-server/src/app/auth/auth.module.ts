import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthMapperService } from "./auth-mapper.service";
import { CoreServicesModule } from "@medorion/backend-common";

@Global()
@Module({
  imports: [CoreServicesModule],
  controllers: [AuthController],
  providers: [AuthService, AuthMapperService],
  exports: [AuthService, AuthMapperService],
})
export class AuthModule {}
