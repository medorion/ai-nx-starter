import { Controller, Get } from '@nestjs/common';
import { IgnoreAuthorization } from '@ai-nx-starter/backend-common';

@Controller('health')
export class HealthController {
  @Get()
  @IgnoreAuthorization()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
