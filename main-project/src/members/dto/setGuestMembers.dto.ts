import { IsNotEmpty, IsNumber } from 'class-validator';
import { Users } from 'src/users/entity/user.entity';

export class SetGuestMembersDto {
  @IsNotEmpty()
  guest: Users[];

  @IsNotEmpty()
  @IsNumber()
  meetingNo: number;
}
