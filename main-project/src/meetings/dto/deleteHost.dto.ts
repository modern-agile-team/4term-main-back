import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteHostDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '삭제하려는 호스트(유저가 호스트 대표인 경우에는 약속 삭제)',
    required: true,
  })
  userNo: number;
}
