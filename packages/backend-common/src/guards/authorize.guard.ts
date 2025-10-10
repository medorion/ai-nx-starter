import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../services/session.service';
import { PinoLogger } from 'nestjs-pino';
import { Role } from '@monorepo-kit/types';
import { Reflector } from '@nestjs/core';
import { SessionInfo } from '../interfaces/session-info.interface';
import { SessionExpiredException } from '../exceptions/session-expired.exception';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  private userRoleWeights: Map<Role, number> = new Map<Role, number>();

  constructor(
    @Inject(Reflector.name) private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthorizeGuard.name);
    this.userRoleWeights.set(Role.Root, 120);
    this.userRoleWeights.set(Role.Admin, 90);
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const sessionToken = authHeader?.split(' ')[1];

    // IgnoreAuthorization attribute, if ignoreAuthorization is true, then skip authorization
    const ignoreAuthorization = this.reflector.get<string>('ignoreAuthorization', context.getHandler());
    if (ignoreAuthorization) {
      // ven If ignoreAuthorization is true, but we have token set up session
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const sessionInfo: SessionInfo | null = await this.sessionService.getSession(sessionToken);
        // Attach decoded token info to request/session
        if (sessionInfo) {
          request.session = sessionInfo; // Store mapped session info
          return true;
        }
      }
      return true;
    }

    if (!sessionToken) {
      this.logger.warn('Session token not found');
      throw new SessionExpiredException('Session token not found');
    }
    const sessionInfo = await this.sessionService.getSession(sessionToken);
    if (!sessionInfo) {
      this.logger.warn('Session not found');
      throw new SessionExpiredException('Session not found');
    }
    // Validate Role
    let role: Role = this.reflector.get<string>('role', context.getHandler()) as Role;
    if (!role) {
      // Default role is root
      role = Role.Root;
    }

    this.validateRole(sessionInfo, role, request.url);

    // Check if session expired
    const expired = sessionInfo.expiresAt < new Date().getTime();
    if (expired) {
      await this.sessionService.killSessionByToken(sessionInfo.userId);
      this.logger.error(`Can Activate, Session Expired, no token payload`);
      throw new SessionExpiredException(`Session Expired, no token payload`);
    }
    // Set session info to request
    request.session = sessionInfo;

    return true;
  }

  private validateRole(sessionInfo: SessionInfo, role: Role, url: string) {
    // Validate role
    if (!this.isUserRoleValid(role, sessionInfo)) {
      this.logger.error(`Validate user role, user ${sessionInfo.email} does not have required role! ${url}`);
      throw new ForbiddenException(`Validate user role, User ${sessionInfo.email} does not have required role! ${url}`);
    }
    return true;
  }

  private isValidRole(role: string): role is keyof typeof Role {
    return role in Role;
  }

  public isUserRoleValid(role: string, payload: SessionInfo): boolean {
    if (!this.isValidRole(role)) {
      this.logger.error(`Validate user role, ${role} is not valid value for UserRole.`);
      return false;
    }

    if (!this.isValidRole(payload.role)) {
      this.logger.error(`Validate user role, ${payload.role} is not valid value for UserRole.`);
      return false;
    }

    const requiredRole: Role = Role[role];
    const userRole: Role = Role[payload.role];

    const userWeight = this.userRoleWeights.get(userRole);
    const requiredWeight = this.userRoleWeights.get(requiredRole);

    if (userWeight === undefined || requiredWeight === undefined) {
      this.logger.error(`Validate user role, role weight not found for user role ${userRole} or required role ${requiredRole}`);
      return false;
    }

    if (userWeight < requiredWeight) {
      this.logger.info(`Validate user role, user ${payload.email} role ${userRole} but it requires ${requiredRole} at least!`);
      return false;
    }

    return true;
  }
}
