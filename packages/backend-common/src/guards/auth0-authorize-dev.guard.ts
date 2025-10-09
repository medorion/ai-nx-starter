import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../services/session.service';
import { PinoLogger } from 'nestjs-pino';
import { Role } from '@medorion/types';
import { SessionInfo } from '../interfaces/session-info.interface';
import { Reflector } from '@nestjs/core';
import { ServerToServerAuthService } from '../services/server-to-server-auth.service';
import { Auth0AuthorizeGuardBase } from './auth0-authorize-base.guard';
import { AppErrorException } from '../exceptions/app-error.exception';
import { EnvVariables } from '../enums/env_variables.emum';

/**
 * Used to bypass authorization in development environment
 * See AppInitializerService in web-server for more details
 */
@Injectable()
export class Auth0AuthorizeDevGuard extends Auth0AuthorizeGuardBase {
  constructor(
    @Inject(Reflector.name) override readonly reflector: Reflector,
    override readonly configService: ConfigService,
    override readonly sessionService: SessionService,
    override readonly serverToServerAuthService: ServerToServerAuthService,
    override readonly logger: PinoLogger,
  ) {
    super(reflector, configService, sessionService, serverToServerAuthService, logger);
  }

  protected override getDecodedToken(token: string): Promise<any> {
    return Promise.resolve(token);
  }

  /*
   * This method is used to get session info from Auth0
   * It will retreive current session or create new session if it doesn't exist
   * It uses Auth0 to get user metadata
   */
  protected override async getSessionInfo(user: any, fingerprint: string, ip: string): Promise<SessionInfo> {
    const token = this.configService.get<string>(EnvVariables.DEV_USER_ID);
    if (!token) {
      throw new AppErrorException('You are in dev mode. Set DEV_USER_ID and other variables');
    }
    const sessionInfo: SessionInfo | null = await this.sessionService.getSession(token as string);
    if (!sessionInfo) {
      throw new AppErrorException('Development Session not found');
    }
    return sessionInfo;
  }
}
