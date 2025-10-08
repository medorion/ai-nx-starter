import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UI_APP_CONTEXT, UIAppContext } from '../intefaces/ui-app-context.interface';

export const authGuard: CanActivateFn = (route, state) => {
  const uiAppContextService: UIAppContext = inject(UI_APP_CONTEXT);
  const router = inject(Router);

  if (uiAppContextService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
