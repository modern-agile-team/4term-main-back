import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateReportUserDto {
  @ApiProperty({
    example: '개발이 너무 재밌어요 어떡하죠?',
    description: '신고글 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '라고 할 뻔ㅋㅋㅋㅋㅋ',
    description: '신고글 내용',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 54,
    description: '신고할 유저 번호',
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  targetUserNo: number;
}
