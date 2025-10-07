import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import {
  UI_APP_CONTEXT,
  UIAppContext,
} from "../intefaces/ui-app-context.interface";

export const roleGuard: CanActivateFn = (route, state) => {
  const uiAppContextService: UIAppContext = inject(UI_APP_CONTEXT);
  const router = inject(Router);
  const expectedRole: string = route.data["role"] ?? "";

  // TODO
  return true;
  // if (uiAppContextService.hasRole(expectedRole)) {
  //   return true;
  // } else {
  //   router.navigate(["/forbidden"]);
  //   return false;
  // }
};
