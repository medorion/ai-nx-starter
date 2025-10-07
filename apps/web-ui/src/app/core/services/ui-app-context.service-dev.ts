import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map, tap, catchError, of } from "rxjs";
import { AppConfigService, ApiAuthService } from "@medorion/api-client";
import {
  UIAppContextDto,
  ClientUserDto,
  IdCodeNameDto,
  IdNameDto,
} from "@medorion/types";
import { UIAppContext } from "../intefaces/ui-app-context.interface";
import { LoggerService } from "./logger.service";
import { StorageKey } from "../enums/storage-key.enum";

@Injectable({
  providedIn: "root",
})
export class UiAppContextServiceDev implements UIAppContext {
  private readonly _uiAppContext$ = new BehaviorSubject<UIAppContextDto | null>(
    null
  );
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | null>(null);

  // Public observables
  public readonly uiAppContext$: Observable<UIAppContextDto | null> =
    this._uiAppContext$.asObservable();
  public readonly isLoading$: Observable<boolean> =
    this._isLoading$.asObservable();
  public readonly error$: Observable<string | null> =
    this._error$.asObservable();

  // Specific observables for individual properties
  public readonly currentUser$: Observable<ClientUserDto | null> =
    this.uiAppContext$.pipe(map((context) => context?.currentUser || null));

  public readonly currentOrganization$: Observable<IdCodeNameDto | null> =
    this.uiAppContext$.pipe(map((context) => context?.currentOrg || null));

  public readonly availableOrganizations$: Observable<IdCodeNameDto[]> =
    this.uiAppContext$.pipe(
      map((context) => context?.availableOrganizations || [])
    );

  public readonly availableSolutions$: Observable<IdNameDto[]> =
    this.uiAppContext$.pipe(
      map((context) => context?.availableSolutions || [])
    );

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly apiAuthService: ApiAuthService,
    private readonly logger: LoggerService
  ) {}

  /**
   * Initialize the service by loading UI app context from server
   */
  init(): Observable<UIAppContextDto | null> {
    this.logger.info("UI Context development");
    this._isLoading$.next(true);
    this._error$.next(null);
    this.appConfigService.fingerprint = localStorage.getItem(
      StorageKey.Fingerprint
    ) as string;
    // Try to log in, in dev mode
    return this.apiAuthService.getUiAppContext().pipe(
      tap((context: UIAppContextDto) => {
        this._uiAppContext$.next(context);
        this._isLoading$.next(false);
      }),
      catchError((error) => {
        console.error("Failed to load UI App Context:", error);
        this._error$.next("Failed to load application context");
        this._isLoading$.next(false);
        return of(null);
      })
    );
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

  /**
   * Get current organization (synchronous)
   */
  get currentOrganization(): IdCodeNameDto | null {
    return this.currentContext?.currentOrg || null;
  }

  /**
   * Switch to a different organization
   */
  switchOrganization(orgCode: string): void {
    const availableOrgs = this.currentContext?.availableOrganizations || [];
    const newOrg = availableOrgs.find((org) => org.code === orgCode);

    if (newOrg && this.currentContext) {
      const updatedContext = {
        ...this.currentContext,
        currentOrg: newOrg,
      };
      this._uiAppContext$.next(updatedContext);
      this.appConfigService.orgCode = orgCode;
    }
  }

  logIn(): void {
    // Only for dev
    this.logger.info("Login");
  }

  logOut(): void {
    // Only for dev
    this.logger.info("Logout");
  }

  isLoggedIn(): boolean {
    return true;
  }
}
