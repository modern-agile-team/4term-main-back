import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class FriendRequestDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '요청을 보낸 유저no',
  })
  senderNo: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '요청을 받은 유저no',
  })
  receiverNo: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 2,
    description: '친구 신청을 보낼 유저의 no => receiverNo',
  })
  friendNo: number;
}
