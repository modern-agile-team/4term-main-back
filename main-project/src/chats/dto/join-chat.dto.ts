import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class JoinChatRoomDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
  })
  userNo: number;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 3,
  })
  chatRoomNo: number;
}
