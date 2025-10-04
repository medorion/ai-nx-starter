import { Injectable } from "@angular/core";

export interface IAuth0Settings {
  domain: string;
  clientId: string;
  authorizationParams: {
    redirect_uri?: string;
    audience?: string;
    scope?: string;
  };
  cacheLocation: "localstorage" | "memory";
  useRefreshTokens: boolean;
}

export interface ApiConfig {
  apiUrl: string;
  enableLogging?: boolean;
  retryCount?: number;
  timeout?: number;
  orgCode: string;
  token?: string;
  fingerprint?: string;
  version?: string;
  auth0Settings: IAuth0Settings;
}

@Injectable({ providedIn: "root" })
export class AppConfigService {
  private config: ApiConfig = {
    apiUrl: "http://localhost:3030",
    enableLogging: false,
    retryCount: 3,
    timeout: 30000,
    orgCode: "",
    token: "",
    fingerprint: "",
    version: "1.0.0",
    auth0Settings: {
      domain: "",
      clientId: "",
      authorizationParams: {},
      cacheLocation: "localstorage",
      useRefreshTokens: true,
    },
  };

  loadConfig(): Promise<void> {
    return fetch("/assets/config.json")
      .then((response) => response.json())
      .then((config) => {
        this.config = { ...this.config, ...config };
      })
      .catch(() => {
        // Use default config if loading fails
        console.warn("Could not load config.json, using default configuration");
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
    return this.config.orgCode || "";
  }

  set orgCode(value: string) {
    this.config.orgCode = value;
  }
}
