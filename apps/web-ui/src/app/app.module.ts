import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';

// Auth0
import { AuthModule, AuthService as Auth0Service, AuthClientConfig } from '@auth0/auth0-angular';

// ng-zorro locale
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { AppComponent } from './app.component';
import { routes } from './app.routes';

// Shared Modules
import { SharedModule } from './shared/shared.module';

// Layout Module
import { LayoutModule } from './layout/layout.module';

// Examples Module
import { ExamplesModule } from './features/examples/examples.module';
import { GlobalErrorHandler } from './core/interceptors/global-error-handler';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { GlobalHttpInterceptor } from './core/interceptors/global-http.interceptor';
import { HideInProdDirective } from './shared/directives/hide-in-prod.directive';
import { APP_INITIALIZER } from '@angular/core';
import { AppConfigService } from '@ai-nx-starter/api-client';
import { environment } from '../environments/environment';
import { FingerprintService } from './core/services/fingerprint.service';
import { StorageKey } from './core/enums/storage-key.enum';
import { UiAppContextService } from './core/services/ui-app-context.service';

// Register locale data
registerLocaleData(en);

// Initialize app config
function initApp(appConfigService: AppConfigService): () => Promise<void> {
  return async () => {
    // Load app config
    await appConfigService.loadConfig();
    const config = appConfigService.getConfig();
    const token = localStorage.getItem(StorageKey.Token);
    if (token) {
      config.token = token;
    }
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    ExamplesModule,
    HideInProdDirective,
    SharedModule,
    LayoutModule,
    AuthModule.forRoot({
      domain: 'placeholder-domain.auth0.com', // Will be overridden
      clientId: 'placeholder-client-id', // Will be overridden
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
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppConfigService, AuthClientConfig, FingerprintService],
      multi: true,
    },
    UiAppContextService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
