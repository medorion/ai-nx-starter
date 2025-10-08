import { Injectable } from '@nestjs/common';
import { ClientUserDto } from '@medorion/types';
import { SessionInfo } from '@medorion/backend-common';

@Injectable()
export class AuthMapperService {
  /**
   * Maps SessionInfo to ClientUserDto
   * @param sessionInfo - The session information from authentication
   * @returns ClientUserDto with mapped fields
   */
  mapSessionInfoToClientUserDto(sessionInfo: SessionInfo): ClientUserDto {
    const clientUserDto: ClientUserDto = {
      id: sessionInfo.userId,
      displayName: this.extractFullName(sessionInfo.email),
      role: sessionInfo.role,
      email: sessionInfo.email,
      organizationCode: sessionInfo.organizationCode,
      phone: sessionInfo.phone,
      picture: sessionInfo.picture,
    };

    return clientUserDto;
  }

  /**
   * Extracts first name from email (before @ symbol)
   * @param email - User's email address
   * @returns First name or email prefix
   */
  private extractFirstName(email: string): string {
    if (!email) return '';
    const emailPrefix = email.split('@')[0];
    const nameParts = emailPrefix.split('.');
    return nameParts[0] ? this.capitalize(nameParts[0]) : emailPrefix;
  }

  /**
   * Extracts last name from email (if available in format firstname.lastname@domain)
   * @param email - User's email address
   * @returns Last name or empty string
   */
  private extractLastName(email: string): string {
    if (!email) return '';
    const emailPrefix = email.split('@')[0];
    const nameParts = emailPrefix.split('.');
    return nameParts.length > 1 ? this.capitalize(nameParts[1]) : '';
  }

  /**
   * Extracts full name from email
   * @param email - User's email address
   * @returns Full name formatted from email
   */
  private extractFullName(email: string): string {
    const firstName = this.extractFirstName(email);
    const lastName = this.extractLastName(email);
    return lastName ? `${firstName} ${lastName}` : firstName;
  }

  /**
   * Capitalizes the first letter of a string
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
