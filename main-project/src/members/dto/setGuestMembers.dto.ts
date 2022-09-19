import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class SetGuestMembersDto {
  @IsNotEmpty()
  @IsObject()
  guest: number[];

  @IsNotEmpty()
  @IsNumber()
  meetingNo: number;
}
