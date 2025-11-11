import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';

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

// Feature Modules
import { BackofficeModule } from './features/backoffice/backoffice.module';

import { GlobalErrorHandler } from './core/interceptors/global-error-handler';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { GlobalHttpInterceptor } from './core/interceptors/global-http.interceptor';
import { HideInProdDirective } from './shared/directives/hide-in-prod.directive';
import { APP_INITIALIZER } from '@angular/core';
import { AppConfigService } from '@ai-nx-starter/api-client';
import { environment } from '../environments/environment';
import { StorageKey } from './core/enums/storage-key.enum';
import { UiAppContextService } from './core/services/ui-app-context.service';
import { ThemeService } from './core/services/theme.service';

// Register locale data
registerLocaleData(en);

// Initialize app config
function initApp(appConfigService: AppConfigService, themeService: ThemeService): () => Promise<void> {
  return async () => {
    // Initialize theme first (synchronous, just reads localStorage and sets CSS class)
    // This ensures theme is applied before any components render

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
    HideInProdDirective,
    SharedModule,
    LayoutModule,
    BackofficeModule,
  ],
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
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
      deps: [AppConfigService, ThemeService],
      multi: true,
    },
    UiAppContextService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
