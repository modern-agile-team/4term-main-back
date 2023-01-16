import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class InviteUserDTO {
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
  targetUserNo: number;
}
