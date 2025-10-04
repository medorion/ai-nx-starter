import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { NgModuleRef } from '@angular/core';
import { CustomAngularContext } from './app/core/custom-angular-context';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((moduleRef: NgModuleRef<AppModule>) => {
    CustomAngularContext.init(moduleRef.injector);
    console.log('Application started successfully');
  })
  .catch((err: any) => console.error(err));
