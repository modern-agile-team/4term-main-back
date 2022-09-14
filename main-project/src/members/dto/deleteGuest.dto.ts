import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteGeustDto {
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
