import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UIAppContextDto, ClientUserDto } from '@monorepo-kit/types';
import { SessionInfo, SessionExpiredException } from '@monorepo-kit/backend-common';
import { AuthMapperService } from './auth-mapper.service';
import { SessionService } from '@monorepo-kit/backend-common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private readonly authMapperService: AuthMapperService,
    private readonly sessionService: SessionService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  public async getUiAppContext(session: SessionInfo): Promise<UIAppContextDto> {
    if (!session) {
      this.logger.error('Session must not be null or undefined');
      throw new SessionExpiredException('Session must not be null or undefined');
    }
    // Map session info to user DTO
    const currentUser: ClientUserDto = this.authMapperService.mapSessionInfoToClientUserDto(session);
    return {
      currentUser,
    };
  }
}
