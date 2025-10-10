import { Controller, Get, Post, Body, Session, Req, UnprocessableEntityException } from '@nestjs/common';
import { UIAppContextDto } from '@monorepo-kit/types';
import { AuthService } from './auth.service';
import { SessionInfo } from '@monorepo-kit/backend-common';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ui-app-context')
  getUiAppContext(@Session() session: SessionInfo): Promise<UIAppContextDto> {
    return this.authService.getUiAppContext(session);
  }
}
