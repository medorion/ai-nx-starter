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
    const autoLogInSampleUser = this.configService.get<string>(EnvVariables.AUTO_LOG_IN_DEV_USER);
    if (environment == 'development' && autoLogInSampleUser == 'true') {
      await this.initDevUser();
    }

    this.logger.info('Application initialization completed');
  }

  private async initDevUser() {
    const avOrg = this.configService.get<string>(EnvVariables.DEV_USER_ORG_CODES) || '';
    const sessionInfo: SessionInfo = {
      userId: this.configService.get<string>(EnvVariables.DEV_USER_ID),
      email: this.configService.get<string>(EnvVariables.DEV_USER_EMAIL),
      phone: '',
      organizationId: 'Demo',
      organizationCode: this.configService.get<string>(EnvVariables.DEV_USER_ORG_CODE),
      creationDate: new Date().getTime(),
      role: this.configService.get<string>(EnvVariables.DEV_USER_ROLE) as Role,
      authorizedUrl: '',
      rootOrgId: '',
      createdAt: new Date().getTime(),
      expiresAt: new Date().getTime() + 2_592_000_000,
      serverVersion: '1.0.0',
      fingerprint: this.configService.get<string>(EnvVariables.DEV_USER_FINDERPRINT),
      clientId: '',
      availableOrganizations: avOrg.split(','),
    };

    await this.sessionService.createSessionWithToken(
      sessionInfo,
      '127.0.0.1',
      this.configService.get<string>(EnvVariables.DEV_USER_ID),
      2_592_000_000, // 30 days
    );
    this.logger.info('Developer user initialized');
  }
}
