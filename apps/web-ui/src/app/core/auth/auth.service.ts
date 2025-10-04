import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = signal<{ username: string; roles: string[] } | null>(null);

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
