import { Routes } from "@angular/router";
import { environment } from "../environments/environment";
import { RedirectingToLoginComponent } from "./shared/pages/redirecting-to-login/redirecting-to-login.component";
import { PageNotFoundComponent } from "./shared/pages/page-not-found/page-not-found.component";
import { LoadingComponent } from "./shared/pages/loading/loading.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "loading",
    pathMatch: "full",
  },
  {
    path: "loading",
    component: LoadingComponent,
    data: { breadcrumb: "Loading..." },
  },
  {
    path: "solutions",
    loadChildren: () =>
      import("./features/solutions/solutions.module").then(
        (m) => m.SolutionsModule
      ),
    data: { breadcrumb: "Solutions" },
  },
  {
    path: "backoffice",
    loadChildren: () =>
      import("./features/backoffice/backoffice.module").then(
        (m) => m.BackofficeModule
      ),
    data: { breadcrumb: "Backoffice" },
  },
  {
    path: "operations",
    loadChildren: () =>
      import("./features/operation/operation.module").then(
        (m) => m.OperationModule
      ),
    data: { breadcrumb: "Operations" },
  },
  {
    path: "redirecting-to-login",
    component: RedirectingToLoginComponent,
    data: { breadcrumb: "Redirecting to login" },
  },
  {
    path: "**",
    component: PageNotFoundComponent,
    data: { breadcrumb: "Page not found" },
  },
];

// // Add examples route only in development
// if (!environment.production) {
//   routes.unshift({
//     path: "examples",
//     loadChildren: () =>
//       import("./features/examples/examples.module").then(
//         (m) => m.ExamplesModule
//       ),
//     data: { breadcrumb: "Examples" },
//   });
// }
