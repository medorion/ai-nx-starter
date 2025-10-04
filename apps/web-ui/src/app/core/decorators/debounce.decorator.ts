/*
  Example
  @debounce(500)
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    console.log('Searching for:', value);
    // Call API or filter list
  }
    We’ll use setTimeout instead of a Subject to keep it lightweight for UI events.
*/
export function debounce(timeout: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // store original function for future use
    const original = descriptor.value;
    const timeoutKey = `__debounceTimeout_${String(propertyKey)}`;

    // override original function body
    descriptor.value = function debounce(...args: any[]) {
      const self = this as any;

      // clear previous timeout for this specific instance and method
      if (self[timeoutKey]) {
        clearTimeout(self[timeoutKey]);
      }

      // schedule timer for this specific instance
      self[timeoutKey] = setTimeout(() => {
        // call original function
        original.apply(this, args);
        // cleanup timeout reference
        self[timeoutKey] = null;
      }, timeout);
    };

    // return descriptor with new value
    return descriptor;
  };
}
