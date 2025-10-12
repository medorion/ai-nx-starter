import { Controller, Get, Post, Body, Session, Req, HttpCode, HttpStatus, ValidationPipe, Ip } from '@nestjs/common';
import { UIAppContextDto, LoginUserDto, ClientUserDto } from '@ai-nx-starter/types';
import { AuthService } from './auth.service';
import { SessionInfo } from '@ai-nx-starter/backend-common';
import { Request } from 'express';
import { Authorize, IgnoreAuthorization } from '@ai-nx-starter/backend-common';
import { Role } from '@ai-nx-starter/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IgnoreAuthorization()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<{ token: string; user: ClientUserDto }> {
    const userIp = ip || req.ip || '127.0.0.1';
    return await this.authService.login(loginUserDto, userIp);
  }

  @Authorize(Role.Admin)
  @Get('ui-app-context')
  getUiAppContext(@Session() session: SessionInfo): Promise<UIAppContextDto> {
    return this.authService.getUiAppContext(session);
  }

  @IgnoreAuthorization()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Session() session: SessionInfo, @Req() req: Request): Promise<void> {
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.split(' ')[1];

    if (sessionToken) {
      await this.authService.logout(sessionToken, session);
    }
  }
}
