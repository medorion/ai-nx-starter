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

import { App } from './app';
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
import { IconsModule } from './shared/icons/icons.module';
import { HideInProdDirective } from './shared/directives/hide-in-prod.directive';

import { APP_INITIALIZER } from '@angular/core';
import { AppConfigService } from '@medorion/api-client';
import { PubSubService } from './core/services/pub-sub.service';
// Register locale data
registerLocaleData(en);

function initApp(appConfigService: AppConfigService): () => Promise<void> {
  return () => appConfigService.loadConfig();
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
  ],
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: GlobalHttpInterceptor, multi: true },
    // Default language
    { provide: NZ_I18N, useValue: en_US },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppConfigService],
      multi: true,
    },
  ],
  bootstrap: [App],
})
export class AppModule {}
