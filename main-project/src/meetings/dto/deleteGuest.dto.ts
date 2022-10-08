import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteGuestDto {
  //Param
  @IsNotEmpty()
  @IsNumber()
  meetingNo: number;

  //Body
  @IsNotEmpty()
  @IsNumber()
  userNo: number;

  @IsNotEmpty()
  @IsNumber()
  newAdminGuest: number;
}
