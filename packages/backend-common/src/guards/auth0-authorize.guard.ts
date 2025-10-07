import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SessionService } from "../services/session.service";
import { PinoLogger } from "nestjs-pino";
import { ManagementClient } from "auth0";
import { ORG_CODE_PATH_PARAM, Role } from "@medorion/types";
import { SessionInfo } from "../interfaces/session-info.interface";
import { JwtHelper } from "./jwt-helper";
import { SessionExpiredException } from "../exceptions/session-expired.exception";
import { Reflector } from "@nestjs/core";
import { ServerToServerAuthService } from "../services/server-to-server-auth.service";

@Injectable()
export class Auth0AuthorizeGuard implements CanActivate {
  private userRoleWeights: Map<Role, number> = new Map<Role, number>();
  private auth0: ManagementClient;

  constructor(
    @Inject(Reflector.name) private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly serverToServerAuthService: ServerToServerAuthService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(Auth0AuthorizeGuard.name);
    this.userRoleWeights.set(Role.Root, 120);
    this.userRoleWeights.set(Role.ApiAdmin, 100);
    this.userRoleWeights.set(Role.Admin, 90);
    this.userRoleWeights.set(Role.Manager, 80);
    this.userRoleWeights.set(Role.Contributor, 40);
    this.userRoleWeights.set(Role.Employee, 20);
    this.auth0 = new ManagementClient({
      domain: this.configService.get<string>(
        "AUTH0_MANAGEMENT_DOMAIN"
      ) as string,
      clientId: this.configService.get<string>(
        "AUTH0_MANAGEMENT_CLIENT_ID"
      ) as string,
      clientSecret: this.configService.get<string>(
        "AUTH0_MANAGEMENT_CLIENT_SECRET"
      ) as string,
    });
  }

  /*
   * This method is used to get session info from Auth0
   * It will retreive current session or create new session if it doesn't exist
   * It uses Auth0 to get user metadata
   */
  private async getSessionInfo(
    user: any,
    fingerprint: string,
    ip: string
  ): Promise<SessionInfo> {
    let sessionInfo: SessionInfo | null = await this.sessionService.getSession(
      user?.sub
    );
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
        this.sessionService.createExternalSession(
          sessionInfo,
          ip,
          sessionInfo.userId
        );
      } catch (error) {
        // Handle error
        throw new UnauthorizedException(`Unauthorized Access. (${error})`);
      }
    }
    return sessionInfo;
  }

  private mapSessionInfo(user: any, fingerprint: string): SessionInfo {
    const roles = user?.["https://medorion.com/claims/roles"] || [];
    const appMetadata = user?.app_metadata || {};
    const userMetadata = user?.user_metadata || {};

    // Get organization information
    const organizationCode =
      userMetadata?.organizationCode || appMetadata?.organizationCode;
    const availableOrganizations =
      userMetadata?.availableOrganizations ||
      appMetadata?.availableOrganizations ||
      [];
    const phone = appMetadata?.phone;
    return {
      userId: user?.sub as string,
      email: user?.email as string,
      phone,
      creationDate: new Date().getTime(),
      createdAt: new Date().getTime(),
      // Use token expiration if available, otherwise default
      expiresAt: user?.exp ? user.exp * 1000 : new Date().getTime() + 3600000,
      role: roles?.[0] || "",
      serverVersion: "", // ??
      authorizedUrl: undefined,
      organizationCode: organizationCode as string,
      availableOrganizations: availableOrganizations,
      fingerprint,
      picture: user.picture,
    };
  }

  private async getDecodedToken(token: string): Promise<any> {
    try {
      const decoded = await JwtHelper.verifyToken(token);
      return decoded;
    } catch (error) {
      if (error instanceof Error && error.name === "TokenExpiredError") {
        this.logger.error(`Decode Token, Session Expired (${error})`);
        throw new SessionExpiredException(`Session Expired (${error})`);
      } else if (error instanceof Error && error.name === "JsonWebTokenError") {
        this.logger.error(`Decode Token, Unauthorized Access (${error})`);
        throw new UnauthorizedException(`Unauthorized Access (${error})`);
      }
      this.logger.error(`Decode Token, Unknown error (${error})`);
      throw error;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // IgnoreAuthorization attribute, if ignoreAuthorization is true, then skip authorization
    const ignoreAuthorization = this.reflector.get<string>(
      "ignoreAuthorization",
      context.getHandler()
    );
    if (ignoreAuthorization) {
      // ven If ignoreAuthorization is true, but we have token set up session
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader?.split(" ")[1];
        const decoded = await this.getDecodedToken(token);
        const sessionInfo: SessionInfo = await this.getSessionInfo(
          decoded,
          request.headers["md-fp"],
          request.headers["x-forwarded-for"]
        );
        // Attach decoded token info to request/session
        request.session = sessionInfo; // Store mapped session info
        return true;
      }
      return true;
    }
    // Server Authorization attribute
    const serverAuthorization = this.reflector.get<string>(
      "serverAuthorization",
      context.getHandler()
    );
    if (serverAuthorization) {
      request.session =
        await this.serverToServerAuthService.validateToken(request);
      return request.session != null;
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      this.logger.error(
        `Can Activate, Missing or invalid Authorization header`
      );
      throw new ForbiddenException(`Missing or invalid Authorization header`);
    }
    const fingerprint = request.headers["md-fp"];
    const ip = request.headers["x-forwarded-for"];
    const token = authHeader?.split(" ")[1];
    if (!token) {
      this.logger.error(
        `Can Activate, Token Missing for ${request.originalUrl}`
      );
      throw new ForbiddenException(`Token Missing for ${request.originalUrl}`);
    }

    const decoded = await this.getDecodedToken(token);
    const sessionInfo: SessionInfo = await this.getSessionInfo(
      decoded,
      fingerprint,
      ip
    );
    // Attach decoded token info to request/session
    request.session = sessionInfo; // Store mapped session info

    // Validate Role
    let role: Role = this.reflector.get<string>(
      "role",
      context.getHandler()
    ) as Role;
    if (!role) {
      // Default role is root
      role = Role.Root;
    }
    this.validateRole(sessionInfo, role, request.url);

    // Validate fingerprint
    if (!fingerprint) {
      this.logger.error(
        `Can Activate, Missing fingerprint for ${request.originalUrl}`
      );
      throw new ForbiddenException(
        `Missing fingerprint for ${request.originalUrl}`
      );
    }
    if (sessionInfo.fingerprint !== fingerprint) {
      this.logger.error(
        `Can Activate, Fingerprint mismatch for ${request.originalUrl}`
      );
      throw new ForbiddenException(
        `Fingerprint mismatch for ${request.originalUrl}`
      );
    }

    const orgCode = request.params
      ? request.params[`${ORG_CODE_PATH_PARAM}`]
      : null;
    if (
      orgCode &&
      !sessionInfo.availableOrganizations?.includes(orgCode) &&
      sessionInfo.role !== Role.Root
    ) {
      this.logger.error(
        `Can Activate, User ${sessionInfo.email} is not authorized for Organization ${orgCode}!`
      );
      throw new ForbiddenException(
        `Can Activate, User ${sessionInfo.email} is not authorized for Organization ${orgCode}!`
      );
    }

    // Check if session expired
    const expired = sessionInfo.expiresAt < new Date().getTime();
    if (expired) {
      await this.sessionService.killSessionByToken(sessionInfo.userId);
      this.logger.error(`Can Activate, Session Expired, no token payload`);
      throw new SessionExpiredException(`Session Expired, no token payload`);
    }
    return true;
  }

  private validateRole(sessionInfo: SessionInfo, role: Role, url: string) {
    // Validate role
    if (!this.isUserRoleValid(role, sessionInfo)) {
      this.logger.error(
        `Validate user role, user ${sessionInfo.email} does not have required role! ${url}`
      );
      throw new ForbiddenException(
        `Validate user role, User ${sessionInfo.email} does not have required role! ${url}`
      );
    }
    return true;
  }

  private isValidRole(role: string): role is keyof typeof Role {
    return role in Role;
  }

  public isUserRoleValid(role: string, payload: SessionInfo): boolean {
    if (!this.isValidRole(role)) {
      this.logger.error(
        `Validate user role, ${role} is not valid value for UserRole.`
      );
      return false;
    }

    if (!this.isValidRole(payload.role)) {
      this.logger.error(
        `Validate user role, ${payload.role} is not valid value for UserRole.`
      );
      return false;
    }

    const requiredRole: Role = Role[role];
    const userRole: Role = Role[payload.role];

    const userWeight = this.userRoleWeights.get(userRole);
    const requiredWeight = this.userRoleWeights.get(requiredRole);

    if (userWeight === undefined || requiredWeight === undefined) {
      this.logger.error(
        `Validate user role, role weight not found for user role ${userRole} or required role ${requiredRole}`
      );
      return false;
    }

    if (userWeight < requiredWeight) {
      this.logger.info(
        `Validate user role, user ${payload.email} role ${userRole} but it requires ${requiredRole} at least!`
      );
      return false;
    }

    return true;
  }
}
