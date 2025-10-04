import { EnvironmentInjector } from '@angular/core';

/**
 * Custom Angular context
 * Used to enable access to the Angular injector from outside the Angular application
 */
export class CustomAngularContext {
  private static _injector: EnvironmentInjector;

  public static get injector(): EnvironmentInjector {
    return CustomAngularContext._injector;
  }

  public static init(value: EnvironmentInjector) {
    CustomAngularContext._injector = value;
  }
}
