import { SetMetadata } from '@nestjs/common';
import { Role } from '@medorion/types';

export const Authorize = (role: Role) => SetMetadata('role', role);
