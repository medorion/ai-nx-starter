import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import {
  UIAppContextDto,
  ClientUserDto,
  IdCodeNameDto,
  IdNameDto,
  ExternalLoginDto,
  Role,
} from "@medorion/types";
import {
  SessionInfo,
  SessionExpiredException,
  AppErrorException,
} from "@medorion/backend-common";
import { AuthMapperService } from "./auth-mapper.service";
import { SessionService } from "@medorion/backend-common";
import { PinoLogger } from "nestjs-pino";
import {
  OrganizationDbService,
  SolutionDbService,
} from "@medorion/data-access-layer";

@Injectable()
export class AuthService {
  constructor(
    private readonly authMapperService: AuthMapperService,
    private readonly sessionService: SessionService,
    private readonly organizationDbService: OrganizationDbService,
    private readonly solutionDbService: SolutionDbService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AuthService.name);
  }

  private async getAvailableSolutions(
    orgCode: string,
    session: SessionInfo
  ): Promise<IdNameDto[]> {
    const solutions = await this.solutionDbService.findActiveByOrgCode(orgCode);
    // Root can view all solutions
    if (session.role === Role.Root) {
      return solutions.map((sol) => ({
        id: sol.id,
        name: sol.name,
      }));
    } else {
      return solutions
        .filter((sol) => sol.allowedUserIds.includes(session.userId))
        .map((sol) => ({
          id: sol.id,
          name: sol.name,
        }));
    }
  }

  private async getAvalidableOrganizations(
    session: SessionInfo
  ): Promise<IdCodeNameDto[]> {
    // There is small number of organization so we can filter here
    const organizations = await this.organizationDbService.findAll();
    // Root can view all organizations
    if (session.role === Role.Root) {
      return organizations.map((org) => ({
        id: org.id,
        code: org.code,
        name: org.name,
      }));
    } else {
      return organizations
        .filter((org) => session.availableOrganizations?.includes(org.code))
        .map((org) => ({
          id: org.id,
          code: org.code,
          name: org.name,
        }));
    }
  }

  public async getUiAppContext(session: SessionInfo): Promise<UIAppContextDto> {
    // Map session info to user DTO
    const currentUser: ClientUserDto =
      this.authMapperService.mapSessionInfoToClientUserDto(session);

    const availableOrganizations: IdCodeNameDto[] =
      await this.getAvalidableOrganizations(session);

    // session.organizationCode
    const currentOrg: IdCodeNameDto = availableOrganizations.find(
      (org) => org.code === session.organizationCode
    );

    if (!currentOrg) {
      this.logger.error("Current organization not found");
      throw new AppErrorException("Current organization not found");
    }

    const availableSolutions: IdNameDto[] = await this.getAvailableSolutions(
      session.organizationCode,
      session
    );

    return {
      currentUser,
      currentOrg,
      availableOrganizations,
      availableSolutions,
    };
  }

  async externalLogout(session: SessionInfo): Promise<void> {
    if (!session) {
      this.logger.error("Logout parameter must contain session");
      throw new UnprocessableEntityException(
        "Logout parameter must contain session"
      );
    }
    await this.sessionService.killSessionByToken(session.userId);
    this.logger.info(`User (${session.email}) logged out`);
  }

  // This method is called when user logs in from external provider
  // It updates the last login time of the user, and users organization, fingerprint and ip
  public async externalLogin(
    userLoginDto: ExternalLoginDto,
    ip: string,
    fingerprint: string,
    session: SessionInfo
  ): Promise<void> {
    if (!session) {
      this.logger.error("Session Expired, no token payload");
      throw new SessionExpiredException("Session Expired, no token payload");
    }
    session.organizationCode = userLoginDto.orgCode;
    session.fingerprint = fingerprint;
    await this.sessionService.updateSession(session.userId, session);
    this.logger.info(
      `User (${session.email}) logged in from external provider`
    );
  }
}
