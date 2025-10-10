import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UiAppContextService } from '../services/ui-app-context.service';

export const authGuard: CanActivateFn = (route, state) => {
  const uiAppContextService: UiAppContextService = inject(UiAppContextService);
  const router = inject(Router);

  if (uiAppContextService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/redirecting-to-login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
