import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteGuestDto {
  @IsNotEmpty()
  @IsNumber()
  meetingNo: number;

  @IsNotEmpty()
  @IsNumber()
  userNo: number;

  @IsNotEmpty()
  @IsNumber()
  newAdminGuest: number;
}
