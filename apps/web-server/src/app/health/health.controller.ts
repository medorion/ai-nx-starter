import { Controller, Get } from '@nestjs/common';
import { IgnoreAuthorization } from '@ai-nx-starter/backend-common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @ApiOperation({ summary: 'Health check', description: 'Check if the API is running and responsive. No authentication required.' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: { status: { type: 'string', example: 'ok' }, timestamp: { type: 'string', example: '2025-01-01T00:00:00.000Z' } },
    },
  })
  @Get()
  @IgnoreAuthorization()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
