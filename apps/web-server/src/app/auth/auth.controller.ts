import { Controller, Get, Post, Body, Session, Req, UnprocessableEntityException } from '@nestjs/common';
import { UIAppContextDto, ExternalLoginDto } from '@medorion/types';
import { AuthService } from './auth.service';
import { SessionInfo } from '@medorion/backend-common';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ui-app-context')
  getUiAppContext(@Session() session: SessionInfo): Promise<UIAppContextDto> {
    return this.authService.getUiAppContext(session);
  }

  @Post('/external-login')
  public externalLogin(@Body() userLoginDto: ExternalLoginDto, @Req() request, @Session() session: SessionInfo) {
    if (!userLoginDto || !request.headers['md-fp']) {
      throw new UnprocessableEntityException('Login parameter must contain userName and email, and md-fp header');
    }
    return this.authService.externalLogin(userLoginDto, request.headers['x-forwarded-for'], request.headers['md-fp'], session);
  }

  @Get('/external-logout')
  public externalLogout(@Session() session: SessionInfo) {
    return this.authService.externalLogout(session);
  }
}
