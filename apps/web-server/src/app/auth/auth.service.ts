import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UIAppContextDto, ClientUserDto, LoginUserDto } from '@ai-nx-starter/types';
import { SessionInfo, SessionExpiredException, AppErrorException } from '@ai-nx-starter/backend-common';
import { AuthMapperService } from './auth-mapper.service';
import { SessionService } from '@ai-nx-starter/backend-common';
import { UserDbService } from '@ai-nx-starter/data-access-layer';
import { PinoLogger } from 'nestjs-pino';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly SESSION_TTL = 2_592_000; // 30 days in seconds

  constructor(
    private readonly authMapperService: AuthMapperService,
    private readonly sessionService: SessionService,
    private readonly userDbService: UserDbService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  public async login(loginUserDto: LoginUserDto, userIp: string): Promise<{ token: string; user: ClientUserDto }> {
    // Find user by email with password
    const user = await this.userDbService.findByEmailWithPassword(loginUserDto.email);

    if (!user) {
      this.logger.warn(`Login attempt failed: user not found for email ${loginUserDto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.userDbService.verifyPassword(loginUserDto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login attempt failed: invalid password for email ${loginUserDto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate session token
    const token = randomBytes(32).toString('hex');

    // Create session info
    const now = Date.now();
    const sessionInfo: SessionInfo = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      picture: user.picture,
      creationDate: now,
      createdAt: now,
      expiresAt: now + this.SESSION_TTL * 1000,
      serverVersion: '1.0.0',
      fingerprint: randomBytes(16).toString('hex'),
      clientId: randomBytes(16).toString('hex'),
    };

    // Create session
    await this.sessionService.createSessionWithToken(sessionInfo, userIp, token, this.SESSION_TTL);

    this.logger.info(`User logged in successfully: ${user.email}`);

    // Fetch user without password for response
    const userWithoutPassword = await this.userDbService.findById(user.id);
    const userDto = this.authMapperService.mapSessionInfoToClientUserDto(sessionInfo);

    return {
      token,
      user: userDto,
    };
  }

  public async getUiAppContext(session: SessionInfo): Promise<UIAppContextDto> {
    if (!session) {
      this.logger.error('Session does not exist, must log in first');
      throw new SessionExpiredException('Session does not exist, must log in first');
    }
    // Map session info to user DTO
    const currentUser: ClientUserDto = this.authMapperService.mapSessionInfoToClientUserDto(session);
    return {
      currentUser,
    };
  }

  public async logout(sessionToken: string, session: SessionInfo): Promise<void> {
    if (!session) {
      this.logger.warn('Logout attempt with no session');
      throw new AppErrorException('Session does not exist, must log in first');
    }

    // Remove session from Redis
    await this.sessionService.killSessionByToken(sessionToken);

    this.logger.info(`User logged out successfully: ${session.email}`);
  }
}
