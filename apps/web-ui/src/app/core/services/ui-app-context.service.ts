import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, of, firstValueFrom } from 'rxjs';
import { AppConfigService, ApiAuthService } from '@ai-nx-starter/api-client';
import { UIAppContextDto, ClientUserDto, IdCodeNameDto, IdNameDto, ErrorStatusCode } from '@ai-nx-starter/types';
import { LoggerService } from './logger.service';
import { StorageKey } from '../enums/storage-key.enum';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UiAppContextService {
  private readonly _uiAppContext$ = new BehaviorSubject<UIAppContextDto | null>(null);
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | null>(null);

  // Public observables
  public readonly uiAppContext$: Observable<UIAppContextDto | null> = this._uiAppContext$.asObservable();
  public readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();
  public readonly error$: Observable<string | null> = this._error$.asObservable();

  // Specific observables for individual properties
  public readonly currentUser$: Observable<ClientUserDto | null> = this.uiAppContext$.pipe(map((context) => context?.currentUser || null));

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly apiAuthService: ApiAuthService,
    private readonly router: Router,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Initialize the service by loading UI app context from server
   */
  async init(): Promise<void> {
    this.logger.info('UI Context development');
    this._isLoading$.next(true);
    this._error$.next(null);

    // Load token and fingerprint from localStorage
    const token = localStorage.getItem(StorageKey.Token);
    if (token) {
      this.appConfigService.token = token;
    }

    this.appConfigService.fingerprint = localStorage.getItem(StorageKey.Fingerprint) as string;

    // Try to log in, in dev mode
    await this.refreshContext();
  }

  /**
   * Get current UI app context value (synchronous)
   */
  get currentContext(): UIAppContextDto | null {
    return this._uiAppContext$.getValue();
  }

  /**
   * Get current user (synchronous)
   */
  get currentUser(): ClientUserDto | null {
    return this.currentContext?.currentUser || null;
  }

  private async refreshContext(): Promise<UIAppContextDto | null> {
    try {
      const context = await firstValueFrom(this.apiAuthService.getUiAppContext());
      this._uiAppContext$.next(context);
      this._isLoading$.next(false);
      return context;
    } catch (error: any) {
      if (error.status === ErrorStatusCode.SessionExpired) {
        // Redirect to login
        this.router.navigate(['/redirecting-to-login']);
        return null;
      } else {
        this._error$.next('Failed to load application context');
        this._isLoading$.next(false);
        return null;
      }
    }
  }

  logIn(): void {
    // Only for dev
    this.logger.info('Login');
  }

  logOut(): void {
    // Only for dev
    this.appConfigService.token = '';
    localStorage.removeItem(StorageKey.Token);
    // this.apiAuthService.logout();
    this.router.navigate(['/redirecting-to-login']);
    this.logger.info('Logout');
  }

  clear() {
    this._uiAppContext$.next(null);
    this._isLoading$.next(false);
    this._error$.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentContext?.currentUser !== null;
  }
}
