import { IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptInvitationDTO {
  @IsNotEmpty()
  @IsNumber()
  inviterNo: number;

  @IsNotEmpty()
  @IsNumber()
  targetUserNo: number;

  @IsNotEmpty()
  @IsNumber()
  type: number;
}
