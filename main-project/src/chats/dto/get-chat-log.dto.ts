import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GetChatLogDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '유저번호',
  })
  userNo: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 3,
    description: '현재 chat log중 가장 낮은 chat log no ',
  })
  currentChatLogNo: number;
}
