import { Injectable } from '@nestjs/common';
import { Auth0User } from '@medorion/backend-common';
import { ClientUserDto } from '@medorion/types';

@Injectable()
export class UserMapperService {
  /**
   * Maps an Auth0User to ClientUserDto
   */
  toDto(auth0User: Auth0User): ClientUserDto {
    const clientUserDto = new ClientUserDto();

    // clientUserDto.id = auth0User.id || "";
    // clientUserDto.firstName = auth0User.firstName || "";
    // clientUserDto.lastName = auth0User.lastName || "";
    // clientUserDto.role = auth0User.mdRole;
    // clientUserDto.email = auth0User.email || "";
    // clientUserDto.status = ""; // Not available in Auth0User, leave empty
    // clientUserDto.organizationCodes = auth0User.mdOrganizations || [];
    // clientUserDto.login = auth0User.login || "";
    // clientUserDto.mobilePhone = auth0User.mobilePhone || "";
    // clientUserDto.name = auth0User.firstName || ""; // Using firstName as name fallback

    return clientUserDto;
  }

  /**
   * Maps multiple Auth0User objects to ClientUserDto array
   */
  toDtoArray(auth0Users: Auth0User[]): ClientUserDto[] {
    return auth0Users.map((user) => this.toDto(user));
  }
}
