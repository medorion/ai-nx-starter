import { Injectable, signal } from "@angular/core";
import { AuthService as Auth0Service } from "@auth0/auth0-angular";
import { Observable, BehaviorSubject } from "rxjs";
import { ApiAuthService, AppConfigService } from "@medorion/api-client";

@Injectable({ providedIn: "root" })
export class AuthService {
  private user = signal<{ username: string; roles: string[] } | null>(null);

  constructor(
    private readonly auth0Service: Auth0Service,
    private readonly apiAuthService: ApiAuthService,
    private readonly appConfigService: AppConfigService
  ) {}

  login(username: string, roles: string[] = []): void {
    this.user.set({ username, roles });
  }

  logout(): void {
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  hasRole(roles: string[]): boolean {
    const u = this.user();
    if (!u) return false;
    return roles.length === 0 || roles.some((r) => u.roles.includes(r));
  }

  currentUser() {
    return this.user();
  }
}
