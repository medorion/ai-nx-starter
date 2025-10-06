import { Observable } from "rxjs";
import {
  UIAppContextDto,
  ClientUserDto,
  IdCodeNameDto,
  IdNameDto,
} from "@medorion/types";

export interface UIAppContext {
  uiAppContext$: Observable<UIAppContextDto | null>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  // Specific observables for individual properties
  currentUser$: Observable<ClientUserDto | null>;
  currentOrganization$: Observable<IdCodeNameDto | null>;

  availableOrganizations$: Observable<IdCodeNameDto[]>;
  availableSolutions$: Observable<IdNameDto[]>;

  init(): void;
}
