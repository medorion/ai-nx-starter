import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../services/session.service';
import { PinoLogger } from 'nestjs-pino';
import { Role } from '@monorepo-kit/types';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  private userRoleWeights: Map<Role, number> = new Map<Role, number>();

  constructor(
    @Inject(Reflector.name) private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthorizeGuard.name);
    this.userRoleWeights.set(Role.Root, 120);
    this.userRoleWeights.set(Role.Admin, 90);
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    return Promise.resolve(true);
  }
}
