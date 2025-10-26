import { SetMetadata } from '@nestjs/common';
import { Role } from '@ai-nx-starter/types';

export const Authorize = (role: Role) => SetMetadata('role', role);
