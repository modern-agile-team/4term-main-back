import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, isString } from 'class-validator';

export class SearchFriendDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '멋쟁이 회장님',
  })
  nickname: string;
}
