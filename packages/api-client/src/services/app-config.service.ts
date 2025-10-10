import { Injectable } from '@angular/core';

export interface ApiConfig {
  apiUrl: string;
  enableLogging?: boolean;
  retryCount?: number;
  timeout?: number;
  orgCode: string;
  token?: string;
  fingerprint?: string;
  version?: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config: ApiConfig = {
    apiUrl: 'http://localhost:3030',
    enableLogging: false,
    retryCount: 3,
    timeout: 30000,
    orgCode: '',
    token: '',
    fingerprint: '',
    version: '1.0.0',
  };

  loadConfig(): Promise<void> {
    return fetch('/assets/config.json')
      .then((response) => response.json())
      .then((config) => {
        this.config = { ...this.config, ...config };
      })
      .catch(() => {
        // Use default config if loading fails
        console.warn('Could not load config.json, using default configuration');
      });
  }

  getConfig(): ApiConfig {
    return this.config;
  }

  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get enableLogging(): boolean {
    return this.config.enableLogging || false;
  }

  get retryCount(): number {
    return this.config.retryCount || 3;
  }

  get timeout(): number {
    return this.config.timeout || 30000;
  }

  get orgCode(): string {
    return this.config.orgCode || '';
  }

  set orgCode(value: string) {
    this.config.orgCode = value;
  }

  get fingerprint(): string {
    return this.config.fingerprint || '';
  }

  set fingerprint(value: string) {
    this.config.fingerprint = value;
  }

  get token(): string {
    return this.config.token || '';
  }

  set token(value: string) {
    this.config.token = value;
  }
}
