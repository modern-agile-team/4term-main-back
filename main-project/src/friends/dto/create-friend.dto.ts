import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateFriendDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  senderNo: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 2,
    description: '친구 신청을 보낼 유저의 no => receiverNo',
  })
  receiverNo: number;
}
