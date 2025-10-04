import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { provideZoneChangeDetection } from "@angular/core";

// Auth0
import {
  AuthModule,
  AuthService as Auth0Service,
  AuthClientConfig,
} from "@auth0/auth0-angular";

// ng-zorro locale
import { NZ_I18N, en_US } from "ng-zorro-antd/i18n";
import { registerLocaleData } from "@angular/common";
import en from "@angular/common/locales/en";

import { App } from "./app";
import { routes } from "./app.routes";

// Shared Modules
import { SharedModule } from "./shared/shared.module";

// Layout Module
import { LayoutModule } from "./layout/layout.module";

// Examples Module
import { ExamplesModule } from "./features/examples/examples.module";
import { GlobalErrorHandler } from "./core/interceptors/global-error-handler";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { GlobalHttpInterceptor } from "./core/interceptors/global-http.interceptor";
import { IconsModule } from "./shared/icons/icons.module";
import { HideInProdDirective } from "./shared/directives/hide-in-prod.directive";

import { APP_INITIALIZER } from "@angular/core";
import { AppConfigService } from "@medorion/api-client";
import { PubSubService } from "./core/services/pub-sub.service";
// Register locale data
registerLocaleData(en);

function initApp(
  appConfigService: AppConfigService,
  authClientConfig: AuthClientConfig
): () => Promise<void> {
  return async () => {
    await appConfigService.loadConfig();
    const authConfig = appConfigService.getConfig().auth0Settings;
    authClientConfig.set({
      domain: authConfig.domain,
      clientId: authConfig.clientId,
      authorizationParams: authConfig.authorizationParams,
      cacheLocation: authConfig.cacheLocation,
      useRefreshTokens:
        appConfigService.getConfig().auth0Settings.useRefreshTokens,
    });
  };
}

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    ExamplesModule,
    HideInProdDirective,
    SharedModule,
    LayoutModule,
    AuthModule.forRoot({
      domain: "placeholder-domain.auth0.com", // Will be overridden
      clientId: "placeholder-client-id", // Will be overridden
    }),
  ],
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    Auth0Service,
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalHttpInterceptor,
      multi: true,
    },
    // Default language
    { provide: NZ_I18N, useValue: en_US },
    // AuthModule is already imported in the imports array
    // Provide the Auth0 configuration
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: (
    //     appConfigService: AppConfigService,
    //     authClientConfig: AuthClientConfig
    //   ) => {
    //     return () => {
    //       // Ensure settings are loaded
    //       return appConfigService.loadConfig().then(() => {
    //         const auth0Config = appConfigService.getConfig().auth0Settings;
    //         // Configure Auth0 client with settings
    //         authClientConfig.set({
    //           domain: auth0Config.domain,
    //           clientId: auth0Config.clientId,
    //           authorizationParams: auth0Config.authorizationParams,
    //           cacheLocation: auth0Config.cacheLocation,
    //           useRefreshTokens: auth0Config.useRefreshTokens,
    //         });
    //         return true;
    //       });
    //     };
    //   },
    //   deps: [AppConfigService, AuthClientConfig],
    //   multi: true,
    // },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppConfigService, AuthClientConfig],
      multi: true,
    },
  ],
  bootstrap: [App],
})
export class AppModule {}
