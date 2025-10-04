import { AppErrorException, Auth0Service, Auth0User, SessionInfo } from '@medorion/backend-common';
import { IdNameDto, Role, UserDto, UserInSessionDto, UsersByChannelDto } from '@medorion/types';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { UserMapperService } from './user-mapper.service';

@Injectable()
export class UsersService {
  private static readonly CUSTOMER_ROLES: string[] = [Role.Manager, Role.Contributor, Role.Employee];

  constructor(
    private readonly auth0Service: Auth0Service,
    private readonly mapper: UserMapperService,
    private readonly logger: PinoLogger
    // private readonly sessionService: SessionService,
  ) {
    this.logger.setContext(UsersService.name); 
  }

  protected async getUsersForAvailableOrganizations(orgCode: string): Promise<Auth0User[]> {
    const users = await this.auth0Service.getAllUsers();
    return users.filter((user) => user.mdOrganizations.includes(orgCode) || user.mdRole === Role.Root);
  }

  public async getUsers(orgCode: string, session: SessionInfo): Promise<UserDto[]> {
    const auth0Users = await this.getUsersForAvailableOrganizations(orgCode);

    // This logic is old logic. It's not longer being used. Probably it should be removed.
    const filteredUsers = auth0Users.filter((user) => {
      if (user.mdRole) {
        return (
          session.role === Role.Root ||
          (session.role === Role.Admin && user.mdRole === Role.Admin) ||
          UsersService.CUSTOMER_ROLES.indexOf(user.mdRole) !== -1
        );
      }
      return false;
    });
    return this.mapper.toDtoArray(filteredUsers);
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    const query = `email:"${email}"`;
    const users = await this.auth0Service.queryUsers(query);
    if (!users || users.length === 0) {
      this.logger.warn('Password reset requested for a non-existent user:');
      return;
    }
    await this.auth0Service.createPasswordChangeTicket(email);
  }

  public async getUsersByIds(orgCode: string, auth0UserIds: string[]): Promise<Auth0User[]> {
    const users: Auth0User[] = [];
    for (const auth0UserId of auth0UserIds) {
      const user = await this.auth0Service.getUserById(auth0UserId);
      if (user.mdRole !== Role.Root && !user.mdOrganizations.includes(orgCode)) {
        throw new AppErrorException('User does not belong to the organization');
      }
      users.push(user);
    }
    return users;
  }

  /**
   * Helper method that convert Auth0 user to SeedListItem
   */
  protected convertAuth0UserToSeedListItem(user: Auth0User): IdNameDto {
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
    };
  }

  /**
   * Gets all Auth0 users for a specific organization and channel
   */
  public async getUsersByChannel(orgCode: string): Promise<UsersByChannelDto> {
    const auth0Users = await this.getUsersForAvailableOrganizations(orgCode);

    const emailUsers = auth0Users.filter((user) => user.email).map((user) => this.convertAuth0UserToSeedListItem(user));
    const smsUsers = auth0Users.filter((user) => user.mobilePhone).map((user) => this.convertAuth0UserToSeedListItem(user));

    return {
      email: emailUsers,
      sms: smsUsers,
    };
  }

  public async getSessions(lastSeconds: number): Promise<UserInSessionDto[]> {
    throw new NotImplementedException();
    const redisSessions = []; // await this.sessionService.getAllSessions(lastSeconds);
    const filteredSessions = redisSessions.filter((sessionUsr) => sessionUsr && sessionUsr.sessionInfo);
    return filteredSessions.map((sessionUsr) => ({
      fullName: sessionUsr.sessionInfo?.email,
      email: sessionUsr.sessionInfo?.email,
      ip: sessionUsr.userIp,
      organization: sessionUsr.sessionInfo?.organizationCode,
    }));
  }
}
