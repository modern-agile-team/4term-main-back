import { IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptInvitationDto {
  @IsNumber()
  @IsNotEmpty()
  senderNo: number;

  @IsNumber()
  @IsNotEmpty()
  type: number;
}
