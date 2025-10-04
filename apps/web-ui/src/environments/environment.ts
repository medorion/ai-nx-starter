import { LogLevel } from '../app/core/services/log-level.enum';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
  appName: 'Enterprise App',
  logLevel: LogLevel.Debug,
  version: '1.0.0',
};
