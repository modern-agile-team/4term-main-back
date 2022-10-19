import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class UpdateReportDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '개발이 너무 재밌어요 어떡하죠?',
    description: '신고글 제목',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '라고 할 뻔ㅋㅋㅋㅋㅋ',
    description: '신고글 내용',
  })
  description: string;
}
