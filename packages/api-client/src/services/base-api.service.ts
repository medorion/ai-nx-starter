import { HttpClient } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { API_PREFIX } from '@monorepo-kit/types';

/**
 * Base API service with common HTTP operations
 */
export abstract class BaseApiService {
  protected get BASE_URL(): string {
    return `${this.config.apiUrl}/${API_PREFIX}/${this.config.orgCode}`;
  }

  constructor(
    protected readonly http: HttpClient,
    private readonly config: AppConfigService,
  ) {}
}
