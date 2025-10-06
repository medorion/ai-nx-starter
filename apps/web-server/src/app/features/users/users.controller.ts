import {
  Controller,
  Get,
  Param,
  Session,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import {
  ORG_CODE_PATH_PARAM,
  ResetPasswordDto,
  Role,
  ClientUserDto,
} from "@medorion/types";
import { Authorize, SessionInfo } from "@medorion/backend-common";
import { UsersByChannelDto } from "@medorion/types";
import { UserInSessionDto } from "@medorion/types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("reset-password")
  @Authorize(Role.Root)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resetUserPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<void> {
    return this.usersService.sendPasswordResetEmail(resetPasswordDto.email);
  }

  @Get()
  @Authorize(Role.Admin)
  public getUsers(
    @Param(`${ORG_CODE_PATH_PARAM}`) orgCode: string,
    @Session() session: SessionInfo
  ): Promise<ClientUserDto[]> {
    return this.usersService.getUsers(orgCode, session);
  }

  @Get("channel")
  @Authorize(Role.Admin)
  public getUsersByChannel(
    @Param(`${ORG_CODE_PATH_PARAM}`) orgCode: string
  ): Promise<UsersByChannelDto> {
    return this.usersService.getUsersByChannel(orgCode);
  }

  @Get("sessions/:lastSeconds")
  @Authorize(Role.Root)
  public sessions(
    @Param(`${ORG_CODE_PATH_PARAM}`) orgCode: string,
    @Param("lastSeconds") lastSeconds: number
  ): Promise<UserInSessionDto[]> {
    return this.usersService.getSessions(Number(lastSeconds));
  }
}
