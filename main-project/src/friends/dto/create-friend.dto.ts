import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateFriendDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  requestUserNo: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 2,
  })
  acceptUserNo: number;
}
