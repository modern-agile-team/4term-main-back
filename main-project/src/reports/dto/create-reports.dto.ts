import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateReportDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 21, description: 'User 번호' })
  userNo: number;

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
