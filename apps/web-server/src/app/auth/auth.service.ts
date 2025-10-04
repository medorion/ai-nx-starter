import { Injectable } from '@nestjs/common';
import { UiAppContextDto, UserDto, IdCodeNameDto, IdNameDto, Role } from '@medorion/types';
import { SessionInfo } from '@medorion/backend-common';
import { AuthMapperService } from './auth-mapper.service';

@Injectable()
export class AuthService {
  constructor(private readonly authMapperService: AuthMapperService) {}

  getUiAppContext(session: SessionInfo): UiAppContextDto {
    // Map session info to user DTO
    const currentUser: UserDto = this.authMapperService.mapSessionInfoToUserDto(session);

    const currentOrg: IdCodeNameDto = {
      id: '1',
      code: 'medorion-health',
      name: 'Medorion Healthcare',
    };

    const availableOrganizations: IdCodeNameDto[] = [
      {
        id: '1',
        code: 'medorion-health',
        name: 'Medorion Healthcare',
      },
      {
        id: '2',
        code: 'cleveland-clinic',
        name: 'Cleveland Clinic',
      },
      {
        id: '3',
        code: 'mayo-clinic',
        name: 'Mayo Clinic',
      },
      {
        id: '4',
        code: 'johns-hopkins',
        name: 'Johns Hopkins Medicine',
      },
      {
        id: '5',
        code: 'kaiser-permanente',
        name: 'Kaiser Permanente',
      },
    ];

    const availableSolutions: IdNameDto[] = [
      {
        id: '1',
        name: 'MedAdherence',
      },
      {
        id: '2',
        name: 'Diabetes',
      },
      {
        id: '3',
        name: 'SPC',
      },
      {
        id: '4',
        name: 'SUD',
      },
      {
        id: '5',
        name: 'CHAPS',
      },
      {
        id: '6',
        name: 'Marketing',
      },
    ];

    return {
      currentUser,
      currentOrg,
      availableOrganizations,
      availableSolutions,
    };
  }
}
