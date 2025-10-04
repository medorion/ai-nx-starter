import { IdNameDto } from '../../common/id-name.dto';

export class UsersByChannelDto {
  email: IdNameDto[];
  sms: IdNameDto[];
}
