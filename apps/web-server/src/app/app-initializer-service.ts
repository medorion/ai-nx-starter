import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { UserDbService } from '@monorepo-kit/data-access-layer';
import { Role } from '@monorepo-kit/types';

@Injectable()
export class AppInitializerService implements OnModuleInit {
  constructor(
    private readonly userDbService: UserDbService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AppInitializerService.name);
  }

  /**
   * Lifecycle hook that runs after the application has been initialized
   */
  async onModuleInit() {
    this.logger.info('Running application initialization tasks...');
    await this.initDemoUser();

    this.logger.info('Application initialization completed');
  }

  private async initDemoUser() {
    // Make sure demo user exists
    const demoUser = await this.userDbService.findByEmail('demo@demo.com');
    if (!demoUser) {
      await this.userDbService.create({
        email: 'demo@demo.com',
        password: 'demo',
        firstName: 'Demo',
        lastName: 'User',
        role: Role.Admin,
      });
      this.logger.info('Demo user created');
    } else {
      this.logger.info('Demo user already exists');
    }
  }
}
