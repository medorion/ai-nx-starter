import { SetMetadata } from '@nestjs/common';
import { Role } from '@monorepo-kit/types';

export const Authorize = (role: Role) => SetMetadata('role', role);
