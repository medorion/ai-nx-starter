import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UiAppContextService } from '../services/ui-app-context.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const uiAppContextService: UiAppContextService = inject(UiAppContextService);
  const router = inject(Router);
  const expectedRole: string = route.data['role'] ?? '';

  // TODO
  return true;
  // if (uiAppContextService.hasRole(expectedRole)) {
  //   return true;
  // } else {
  //   router.navigate(["/forbidden"]);
  //   return false;
  // }
};
