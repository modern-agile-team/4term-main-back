import { IsNotEmpty } from 'class-validator';

export class CreateFriendDto {
  @IsNotEmpty()
  userNo: number;

  @IsNotEmpty()
  friendNo: number;
}
