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
  adminGuest: number;
}
