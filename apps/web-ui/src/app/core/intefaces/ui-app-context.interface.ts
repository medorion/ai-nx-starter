import { Observable } from 'rxjs';
import { UIAppContextDto, ClientUserDto, IdCodeNameDto, IdNameDto } from '@medorion/types';
import { InjectionToken } from '@angular/core';

export interface UIAppContext {
  uiAppContext$: Observable<UIAppContextDto | null>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  // Specific observables for individual properties
  currentUser$: Observable<ClientUserDto | null>;
  currentOrganization$: Observable<IdCodeNameDto | null>;

  availableOrganizations$: Observable<IdCodeNameDto[]>;
  availableSolutions$: Observable<IdNameDto[]>;

  init(): Observable<UIAppContextDto | null>;

  switchOrganization(orgCode: string): void;

  logIn(): void;

  logOut(): void;

  isLoggedIn(): boolean;
}

export const UI_APP_CONTEXT = new InjectionToken<UIAppContext>('UI_APP_CONTEXT');
