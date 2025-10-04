import { ManagementClient, UserInfoResponse } from 'auth0';
import { Role } from '@medorion/types';
import axios from 'axios';
import { Auth0User } from '../interfaces/auth0_user.interface';
import { EnvVariables } from '../enums/env_variables.emum';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Auth0Service {
  private auth0: ManagementClient;

  constructor(private configService: ConfigService) {
    const conn = {
      domain: this.configService.get<string>(EnvVariables.AUTH0_MANAGEMENT_DOMAIN) || '',
      clientId: this.configService.get<string>(EnvVariables.AUTH0_MANAGEMENT_CLIENT_ID) || '',
      clientSecret: this.configService.get<string>(EnvVariables.AUTH0_MANAGEMENT_CLIENT_SECRET) || '',
    }
    this.auth0 = new ManagementClient(conn);
  }

  private mapToAuth0User(user: any): Auth0User {
    return {
      id: user.user_id,
      firstName: user.name,
      lastName: '',
      mobilePhone: user.app_metadata?.phone,
      organization: user.user_metadata?.organizationCode,
      secondEmail: user.email,
      login: user.email,
      email: user.email,
      mdRole: user.app_metadata ? user.app_metadata.role : '',
      mdOrganizations: user.user_metadata?.availableOrganizations || [],
    };
  }

  public async createPasswordChangeTicket(email: string): Promise<void> {
    await axios.post(`https://${this.configService.get<string>(EnvVariables.AUTH0_MANAGEMENT_DOMAIN)}/dbconnections/change_password`, {
      client_id: this.configService.get<string>(EnvVariables.AUTH0_CLIENT_ID),
      email,
      connection: 'Username-Password-Authentication',
    });
  }

  public async getAllUsers(): Promise<Auth0User[]> {
    const response = await this.auth0.users.list({});
    return response['data'].map(this.mapToAuth0User);
  }

  public async getAllOrgUsers(orgCode: string): Promise<Auth0User[]> {
    const response = await this.auth0.users.list({
      q: `user_metadata.organizationCode:"${orgCode}"`,
      search_engine: 'v3',
    });
    return response['data'].map(this.mapToAuth0User);
  }

  public async queryUsers(query: string): Promise<Auth0User[]> {
    const response = await this.auth0.users.list({
      q: query,
      search_engine: 'v3',
    });
    return response['data'].map(this.mapToAuth0User);
  }

  public async getUserById(userId: string): Promise<Auth0User> {
    const response = await this.auth0.users.get(userId);
    return this.mapToAuth0User(response['data']);
  }
}