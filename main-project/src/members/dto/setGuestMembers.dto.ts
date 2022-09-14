import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { Users } from 'src/users/entity/user.entity';

export class SetGuestMembersDto {
  @IsNotEmpty()
  @IsObject()
  guest: Users[];

  @IsNotEmpty()
  @IsNumber()
  meetingNo: number;
}
