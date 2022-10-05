import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteFriendDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  userNo: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 2,
  })
  friendNo: number;
}
