import { IsEnum } from 'class-validator';
import { UserStatus } from '../schemas/user.schema';

export class UpdateStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}
