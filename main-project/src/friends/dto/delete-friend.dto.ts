import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteFriendDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 2,
    description: '친구목록 no',
  })
  friendNo: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 2,
    description: '친구의 userNo',
  })
  friendUserNo: number;
}
