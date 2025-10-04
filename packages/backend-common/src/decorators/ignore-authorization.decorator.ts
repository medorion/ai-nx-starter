import { SetMetadata } from '@nestjs/common';
// Add dummy metadata, any method that have this anotation will omit authorization
export const IgnoreAuthorization = () => SetMetadata('ignoreAuthorization', 'IgnoreAuthorization');
