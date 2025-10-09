import { LogLevel } from '../app/core/services/log-level.enum';

export const environment = {
  production: true,
  autoLogInDevUser: false,
  apiUrl: 'https://api.yourapp.com/api',
  socketUrl: 'https://api.yourapp.com',
  appName: 'Enterprise App',
  logLevel: LogLevel.Error,
  version: '1.0.0',
};
