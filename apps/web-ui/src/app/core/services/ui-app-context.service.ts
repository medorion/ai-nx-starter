import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, firstValueFrom } from 'rxjs';
import { AppConfigService, ApiAuthService } from '@medorion/api-client';
import { UIAppContextDto, ClientUserDto, IdCodeNameDto, IdNameDto, Role, Auth0UserDto } from '@medorion/types';
import { StorageKey } from '../../core/enums/storage-key.enum';
import { UIAppContext } from '../intefaces/ui-app-context.interface';
import { LoggerService } from '../../core/services/logger.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';

/**
 * Service for managing global state.
 * At all times, we should have :
 * - current user
 * - current organization
 * - available organizations
 * - available solutions
 */
@Injectable({
  providedIn: 'root',
})
export class UIAppContextService implements UIAppContext {
  private readonly _uiAppContext$ = new BehaviorSubject<UIAppContextDto | null>(null);
  public readonly uiAppContext$: Observable<UIAppContextDto | null> = this._uiAppContext$.asObservable();

  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  public readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  private readonly _error$ = new BehaviorSubject<string | null>(null);
  public readonly error$: Observable<string | null> = this._error$.asObservable();

  // Specific observables for individual properties
  public readonly currentUser$: Observable<ClientUserDto | null> = this.uiAppContext$.pipe(map((context) => context?.currentUser || null));

  public readonly currentOrganization$: Observable<IdCodeNameDto | null> = this.uiAppContext$.pipe(
    map((context) => context?.currentOrg || null),
  );

  public readonly availableOrganizations$: Observable<IdCodeNameDto[]> = this.uiAppContext$.pipe(
    map((context) => context?.availableOrganizations || []),
  );

  public readonly availableSolutions$: Observable<IdNameDto[]> = this.uiAppContext$.pipe(
    map((context) => context?.availableSolutions || []),
  );

  private isForbiddenError = false;

  /**
   * Get current user (synchronous)
   */
  get currentUser(): ClientUserDto | null {
    return this.currentContext?.currentUser || null;
  }

  /**
   * Get current organization (synchronous)
   */
  get currentOrganization(): IdCodeNameDto | null {
    return this.currentContext?.currentOrg || null;
  }

  /**
   * Get current UI app context value (synchronous)
   */
  get currentContext(): UIAppContextDto | null {
    return this._uiAppContext$.getValue();
  }

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly apiAuthService: ApiAuthService,
    private readonly auth0: Auth0Service,
    private readonly router: Router,
    private readonly logger: LoggerService,
  ) {
    // Combine user and token information
    this.auth0.user$.subscribe(async (user: any) => {
      if (user && !this.isForbiddenError) {
        try {
          // Get the token when user is available
          const token = await this.refreshAccessToken();
          const mdUser = this.mapAuth0UserToMdUser(user);
          if (mdUser && token) {
            // Add token to the user object
            const savedOrg = this.getCurrentOrganization();
            if (savedOrg && (mdUser.availableOrganizations.includes(savedOrg) || mdUser.role === Role.Root)) {
              mdUser.organizationCode = savedOrg;
            }

            this.setCurrentOrganization(mdUser.organizationCode as string);
            this.apiAuthService.externalLogin({
              orgCode: mdUser.organizationCode as string,
            });
            // this.setUser(mdUser);
            this.refreshContext();
            this.onShouldLogInChange(false);
          }
        } catch (error) {
          this.logger.error('Error getting access token:', error);
          // this.removeUser();
          this.clearContext();
          if (error instanceof Error && error.message === 'Invalid Account Settings') {
            this.isForbiddenError = true;
            // this.clearAllStorage();
            this._error$.next('Invalid Account Settings');
          } else {
            this.onShouldLogInChange(true);
          }
        }
      } else if (!this.isForbiddenError) {
        // this.removeUser();
        this.clearContext();
        this.onShouldLogInChange(true);
      }
    });
  }

  private clearContext() {
    this._uiAppContext$.next(null);
    this._isLoading$.next(false);
    this._error$.next(null);
    this.appConfigService.token = '';
  }

  private async refreshContext(): Promise<UIAppContextDto | null> {
    try {
      const context = await firstValueFrom(this.apiAuthService.getUiAppContext());
      this._uiAppContext$.next(context);
      this._isLoading$.next(false);
      return context;
    } catch (error) {
      this._error$.next('Failed to load application context');
      this._isLoading$.next(false);
      return null;
    }
  }
  /**
   * Initialize the service by loading UI app context from server
   */
  init(): Observable<UIAppContextDto | null> {
    this.logger.info('UI Context production');
    this._isLoading$.next(true);
    this._error$.next(null);
    this.appConfigService.fingerprint = localStorage.getItem(StorageKey.Fingerprint) as string;
    return of(null);
  }

  private onShouldLogInChange(shouldLogIn: boolean) {
    if (shouldLogIn === true) {
      this.logger.info('Should log in');
      this.logIn();
    } else if (shouldLogIn === false) {
      this.logger.info('Redirecting to default');
      this.router.navigate(['/']);
    }
  }

  private mapAuth0UserToMdUser(user: any): Auth0UserDto | null {
    if (!user) {
      // Create a default user object if user is null
      // This ensures we always return an IMdUser type
      return null;
    }
    // Extract claims and metadata
    const roles = user?.['https://medorion.com/claims/roles'] || [];
    const appMetadata = user?.['https://medorion.com/claims/app_metadata'] || {};
    const userMetadata = user?.['https://medorion.com/claims/user_metadata'] || {};

    // Get organization information
    const organizationCode = userMetadata?.organizationCode || user?.organizationCode;
    const availableOrganizations = userMetadata?.availableOrganizations || [];

    const role = this.validateRole(roles);

    // Convert user to IMdUser with all available fields
    const mdUser: Auth0UserDto = {
      id: user?.sub,
      displayName: user?.name || user?.nickname || user?.email,
      organizationCode: organizationCode,
      availableOrganizations: availableOrganizations,
      picture: user?.picture,
      role,
      email: user?.email,
      phone: appMetadata?.phone_number || appMetadata?.phone,
    };

    return mdUser;
  }

  private validateRole(roles: string[]): Role {
    const validRoles = Object.values(Role);

    // Check roles array first (Auth0 RBAC)
    if (roles?.length > 0 && validRoles.includes(roles[0] as Role)) {
      return roles[0] as Role;
    }

    // Throw Invalid Account Settings error to trigger auth-errors component
    throw new Error('Invalid Account Settings');
  }

  private async refreshAccessToken(): Promise<string | null> {
    const token = await firstValueFrom(this.auth0.getAccessTokenSilently());
    this.appConfigService.token = token;
    return token;
  }

  private setCurrentOrganization(orgCode: string): void {
    localStorage.setItem(StorageKey.CurrentOrganization, orgCode);
  }

  private getCurrentOrganization(): string {
    return localStorage.getItem(StorageKey.CurrentOrganization) || '';
  }

  /**
   * Switch to a different organization
   */
  async switchOrganization(orgCode: string): Promise<void> {
    await firstValueFrom(this.apiAuthService.externalLogin({ orgCode }));
    this.setCurrentOrganization(orgCode);
    this.appConfigService.orgCode = orgCode;
    await this.refreshContext();
  }

  // Login with Auth0
  public async logIn(): Promise<void> {
    // Direct login approach - simpler and more reliable
    await this.auth0.loginWithRedirect({
      authorizationParams: {
        prompt: 'login', // Force login prompt
        max_age: 0, // Force new session
      },
    });
  }

  public async logOut(): Promise<void> {
    this.router.navigate(['/redirecting-to-login']);
    await firstValueFrom(this.apiAuthService.externalLogout());
    this.clearContext();
    this.auth0.logout();
  }

  public isLoggedIn(): boolean {
    // Get current context from uiAppContext$ and check if it is not null
    return this.currentContext !== null;
  }
}
