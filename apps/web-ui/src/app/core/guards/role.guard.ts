import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles: string[] = route.data['roles'] ?? [];

  if (authService.hasRole(expectedRoles)) {
    return true;
  } else {
    router.navigate(['/forbidden']);
    return false;
  }
};
