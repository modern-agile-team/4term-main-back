import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteFriendDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
  })
  userNo: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 2,
  })
  friendNo: number;
}
