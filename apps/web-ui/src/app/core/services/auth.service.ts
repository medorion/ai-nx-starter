import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiAuthService, AppConfigService } from '@ai-nx-starter/api-client';
import { LoginUserDto } from '@ai-nx-starter/types';
import { UiAppContextService } from './ui-app-context.service';
import { LoggerService } from './logger.service';
import { StorageKey } from '../enums/storage-key.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly apiAuthService: ApiAuthService,
    private readonly appConfigService: AppConfigService,
    private readonly uiAppContextService: UiAppContextService,
    private readonly router: Router,
    private readonly logger: LoggerService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<void> {
    try {
      // Call the login API
      const response = await firstValueFrom(this.apiAuthService.login(loginUserDto, ''));

      // Store the token in AppConfigService
      this.appConfigService.token = response.token;

      // Store token in localStorage for persistence
      localStorage.setItem(StorageKey.Token, response.token);

      this.logger.info('Login successful', { email: loginUserDto.email });

      // Reinitialize the UI app context to fetch user data
      await this.uiAppContextService.init();

      // Navigate to home page
      this.router.navigate(['/']);
    } catch (error: any) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call the logout API to remove session from server
      await firstValueFrom(this.apiAuthService.logout());
    } catch (error) {
      this.logger.warn('Logout API call failed, clearing local session anyway', error);
    } finally {
      // Clear token from AppConfigService
      this.appConfigService.token = '';

      // Clear token from localStorage
      localStorage.removeItem(StorageKey.Token);

      // Clear other stored data
      localStorage.removeItem(StorageKey.LoggedInUser);

      this.uiAppContextService.clear();
      this.logger.info('Logout successful');

      // Navigate to login page
      this.router.navigate(['/login']);
    }
  }
}
