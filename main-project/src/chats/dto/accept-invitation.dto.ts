import { IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptInvitationDTO {
  @IsNumber()
  @IsNotEmpty()
  inviterNo: number;

  @IsNumber()
  @IsNotEmpty()
  targetUserNo: number;

  @IsNumber()
  @IsNotEmpty()
  type: number;
}
