import { Controller, Get, Post, Body, Session, Req, HttpCode, HttpStatus, ValidationPipe, Ip } from '@nestjs/common';
import { UIAppContextDto, LoginUserDto, ClientUserDto } from '@ai-nx-starter/types';
import { AuthService } from './auth.service';
import { SessionInfo } from '@ai-nx-starter/backend-common';
import { Request } from 'express';
import { Authorize, IgnoreAuthorization } from '@ai-nx-starter/backend-common';
import { Role } from '@ai-nx-starter/types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns session token and user details.',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'a1b2c3d4e5f6...64-char-hex-token' },
        user: { $ref: '#/components/schemas/ClientUserDto' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
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

  @ApiOperation({
    summary: 'Get UI application context',
    description: 'Retrieve current user session information for UI state management. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved context',
    type: UIAppContextDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated - session expired or invalid' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiBearerAuth('bearer')
  @Authorize(Role.Admin)
  @Get('ui-app-context')
  getUiAppContext(@Session() session: SessionInfo): Promise<UIAppContextDto> {
    return this.authService.getUiAppContext(session);
  }

  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidate current session and remove session from Redis. Token will no longer be valid.',
  })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({ status: 401, description: 'Session does not exist' })
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
