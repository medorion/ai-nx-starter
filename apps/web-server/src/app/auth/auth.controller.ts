import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Session } from '@nestjs/common';
import { UiAppContextDto } from '@medorion/types';
import { AuthService } from './auth.service';
import { SessionInfo } from '@medorion/backend-common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ui-app-context')
  getUiAppContext(@Session() session: SessionInfo): UiAppContextDto {
    return this.authService.getUiAppContext(session);
  }
}
