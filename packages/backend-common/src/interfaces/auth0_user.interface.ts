import { Role } from '@medorion/types';

export interface Auth0User {
  id: string;
  firstName: string;
  lastName: string;
  mobilePhone: null;
  organization: string;
  secondEmail: string;
  login: string;
  email: string;
  mdRole: Role;
  mdOrganizations: string[];
}
