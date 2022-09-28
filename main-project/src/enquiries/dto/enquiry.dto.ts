import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class EnquiryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '애인은 어떻게 만들죠?',
    description: '문의사항 제목',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example:
      '진짜 애인한테 잘 해줄 자신이 있는데 애인 만드는 법 좀 알려주세요...',
    description: '문의사항 내용',
  })
  description: string;
}
