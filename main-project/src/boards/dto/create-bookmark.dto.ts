import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
export class CreateBookmarkDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 21, description: 'User 번호' })
  userNo: number;
}
