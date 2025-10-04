import { Injectable } from '@nestjs/common';
import { Auth0User } from '@medorion/backend-common';
import { UserDto } from '@medorion/types';

@Injectable()
export class UserMapperService {
  /**
   * Maps an Auth0User to UserDto
   */
  toDto(auth0User: Auth0User): UserDto {
    const userDto = new UserDto();
    
    userDto.id = auth0User.id || '';
    userDto.firstName = auth0User.firstName || '';
    userDto.lastName = auth0User.lastName || '';
    userDto.role = auth0User.mdRole;
    userDto.email = auth0User.email || '';
    userDto.status = ''; // Not available in Auth0User, leave empty
    userDto.organizationCodes = auth0User.mdOrganizations || [];
    userDto.login = auth0User.login || '';
    userDto.mobilePhone = auth0User.mobilePhone || '';
    userDto.name = auth0User.firstName || ''; // Using firstName as name fallback
    
    return userDto;
  }

  /**
   * Maps multiple Auth0User objects to UserDto array
   */
  toDtoArray(auth0Users: Auth0User[]): UserDto[] {
    return auth0Users.map((user) => this.toDto(user));
  }
}
