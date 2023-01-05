import { IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptInvitationDTO {
  @IsNotEmpty()
  @IsNumber()
  userNo: number;

  @IsNotEmpty()
  @IsNumber()
  targetUserNo: number;

  @IsNotEmpty()
  @IsNumber()
  type: number;
}
