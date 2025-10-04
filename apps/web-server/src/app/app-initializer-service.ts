import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { EnvVariables, SessionInfo, SessionService } from '@medorion/backend-common';
import { Role } from '@medorion/types';

@Injectable()
export class AppInitializerService implements OnModuleInit {
  constructor(
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AppInitializerService.name);
  }

  /**
   * Lifecycle hook that runs after the application has been initialized
   */
  async onModuleInit() {
    this.logger.info('Running application initialization tasks...');

    const environment = this.configService.get<string>(EnvVariables.ENVIRONMENT);
    const autoLogInSampleUser = this.configService.get<string>(EnvVariables.AUTO_LOG_IN_SAMPLE_USER);
    if (environment == 'development' && autoLogInSampleUser == 'true') {
      await this.initDevUser();
    }

    this.logger.info('Application initialization completed');
  }

  private async initDevUser() {
    const sessionInfo: SessionInfo = {
      userId: 'developer@medorion.com',
      email: 'developer@medorion.com',
      phone: '',
      organizationId: 'Demo',
      organizationCode: 'dho',
      creationDate: new Date().getTime(),
      role: Role.Root,
      authorizedUrl: '',
      rootOrgId: '',
      createdAt: new Date().getTime(),
      expiresAt: new Date().getTime() + 2_592_000_000,
      serverVersion: '1.0.0',
      fingerprint: 'FP_DEVELOPMENT',
      clientId: '',
      availableOrganizations: ['dho', 'PACK', 'MHO', 'MHO'],
    };

    await this.sessionService.createSessionWithToken(
      sessionInfo,
      '127.0.0.1',
      'AUTH_DEVELOPMENT',
      2_592_000_000, // 30 days
    );
    this.logger.info('Developer user initialized');
  }
}
