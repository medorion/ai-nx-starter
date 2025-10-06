import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import {
  UIAppContextDto,
  ClientUserDto,
  IdCodeNameDto,
  IdNameDto,
  ExternalLoginDto,
} from "@medorion/types";
import { SessionInfo, SessionExpiredException } from "@medorion/backend-common";
import { AuthMapperService } from "./auth-mapper.service";
import { SessionService } from "@medorion/backend-common";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class AuthService {
  constructor(
    private readonly authMapperService: AuthMapperService,
    private readonly sessionService: SessionService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AuthService.name);
  }

  public getUiAppContext(session: SessionInfo): UIAppContextDto {
    // Map session info to user DTO
    const currentUser: ClientUserDto =
      this.authMapperService.mapSessionInfoToClientUserDto(session);

    const currentOrg: IdCodeNameDto = {
      id: "1",
      code: "medorion-health",
      name: "Medorion Healthcare",
    };

    const availableOrganizations: IdCodeNameDto[] = [
      {
        id: "1",
        code: "medorion-health",
        name: "Medorion Healthcare",
      },
      {
        id: "2",
        code: "cleveland-clinic",
        name: "Cleveland Clinic",
      },
      {
        id: "3",
        code: "mayo-clinic",
        name: "Mayo Clinic",
      },
      {
        id: "4",
        code: "johns-hopkins",
        name: "Johns Hopkins Medicine",
      },
      {
        id: "5",
        code: "kaiser-permanente",
        name: "Kaiser Permanente",
      },
    ];

    const availableSolutions: IdNameDto[] = [
      {
        id: "1",
        name: "MedAdherence",
      },
      {
        id: "2",
        name: "Diabetes",
      },
      {
        id: "3",
        name: "SPC",
      },
      {
        id: "4",
        name: "SUD",
      },
      {
        id: "5",
        name: "CHAPS",
      },
      {
        id: "6",
        name: "Marketing",
      },
    ];

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
    // TODO Check if session is sessionInfo ????
    const sessionInfo = await this.sessionService.getSession(session.userId);
    if (!sessionInfo) {
      this.logger.error("Session Expired, no token payload");
      throw new SessionExpiredException("Session Expired, no token payload");
    }
    session.organizationCode = userLoginDto.orgCode;
    session.fingerprint = fingerprint;
    await this.sessionService.updateSession(session.userId, session);
    this.logger.info(
      `User (${sessionInfo.email}) logged in from external provider`
    );
  }
}
