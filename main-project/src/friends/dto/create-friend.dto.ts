import { IsNotEmpty } from 'class-validator';

export class CreateFriendDto {
  @IsNotEmpty()
  requestUserNo: number;

  @IsNotEmpty()
  acceptUserNo: number;
}
