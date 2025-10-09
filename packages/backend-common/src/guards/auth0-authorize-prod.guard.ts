import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../services/session.service';
import { PinoLogger } from 'nestjs-pino';
import { SessionInfo } from '../interfaces/session-info.interface';
import { JwtHelper } from './jwt-helper';
import { SessionExpiredException } from '../exceptions/session-expired.exception';
import { Reflector } from '@nestjs/core';
import { ServerToServerAuthService } from '../services/server-to-server-auth.service';
import { Auth0AuthorizeGuardBase } from './auth0-authorize-base.guard';

@Injectable()
export class Auth0AuthorizeProdGuard extends Auth0AuthorizeGuardBase {
  constructor(
    @Inject(Reflector.name) override readonly reflector: Reflector,
    override readonly configService: ConfigService,
    override readonly sessionService: SessionService,
    override readonly serverToServerAuthService: ServerToServerAuthService,
    override readonly logger: PinoLogger,
  ) {
    super(reflector, configService, sessionService, serverToServerAuthService, logger);
  }

  /*
   * This method is used to get session info from Auth0
   * It will retreive current session or create new session if it doesn't exist
   * It uses Auth0 to get user metadata
   */
  protected override async getSessionInfo(user: any, fingerprint: string, ip: string): Promise<SessionInfo> {
    let sessionInfo: SessionInfo | null = await this.sessionService.getSession(user?.sub);
    if (!sessionInfo) {
      // Call Auth0 to get metadata
      try {
        // Merge user data with token data { id: user.sub }
        const userData = await this.auth0.users.get(user.sub);
        const enrichedUser = {
          ...user,
          ...userData, // userData.data
        };
        // Map the enriched user data to SessionInfo
        sessionInfo = this.mapSessionInfo(enrichedUser, fingerprint);
        this.sessionService.createExternalSession(sessionInfo, ip, sessionInfo.userId);
      } catch (error) {
        // Handle error
        throw new UnauthorizedException(`Unauthorized Access. (${error})`);
      }
    }
    return sessionInfo;
  }

  private mapSessionInfo(user: any, fingerprint: string): SessionInfo {
    const roles = user?.['https://medorion.com/claims/roles'] || [];
    const appMetadata = user?.app_metadata || {};
    const userMetadata = user?.user_metadata || {};

    // Get organization information
    const organizationCode = userMetadata?.organizationCode || appMetadata?.organizationCode;
    const availableOrganizations = userMetadata?.availableOrganizations || appMetadata?.availableOrganizations || [];
    const phone = appMetadata?.phone;
    return {
      userId: user?.sub as string,
      email: user?.email as string,
      phone,
      creationDate: new Date().getTime(),
      createdAt: new Date().getTime(),
      // Use token expiration if available, otherwise default
      expiresAt: user?.exp ? user.exp * 1000 : new Date().getTime() + 3600000,
      role: roles?.[0] || '',
      serverVersion: '', // ??
      authorizedUrl: undefined,
      organizationCode: organizationCode as string,
      availableOrganizations: availableOrganizations,
      fingerprint,
      picture: user.picture,
    };
  }

  protected override async getDecodedToken(token: string): Promise<any> {
    try {
      const decoded = await JwtHelper.verifyToken(token);
      return decoded;
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        this.logger.error(`Decode Token, Session Expired (${error})`);
        throw new SessionExpiredException(`Session Expired (${error})`);
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        this.logger.error(`Decode Token, Unauthorized Access (${error})`);
        throw new UnauthorizedException(`Unauthorized Access (${error})`);
      }
      this.logger.error(`Decode Token, Unknown error (${error})`);
      throw error;
    }
  }
}
