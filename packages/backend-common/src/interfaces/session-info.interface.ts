import { Role } from '@monorepo-kit/types';

export interface SessionInfo {
  userId: string;
  email: string;
  phone?: string;
  creationDate: number;
  role: Role;
  authorizedUrl?: string;
  rootOrgId?: string;
  createdAt: number;
  expiresAt: number;
  serverVersion: string;
  fingerprint?: string;
  clientId?: string;
  availableOrganizations?: string[];
  picture?: string;
}
