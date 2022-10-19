import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateFriendDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  receiverNo: number;

  @IsNotEmpty()
  @ApiProperty({
    example: 2,
  })
  senderNo: number;
}
