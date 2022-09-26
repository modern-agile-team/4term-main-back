import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteHostDto {
  @IsNotEmpty()
  @IsNumber()
  meetingNo: number;

  @IsNotEmpty()
  @IsNumber()
  userNo: number;
}
