import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class AnnouncesDto {
  @ApiProperty({
    example: '김민호 취업 공지 :)',
    description: '공지사항 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      '모던 애자일 4기 백엔드팀 김민호씨가 12월 25일 부로 카카오톡에 입사했음을 알립니다 짝짝짝~',
    description: '공지사항 내용',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  // @ApiProperty({
  //   example: '1',
  //   description: '공지사항 타입 1:이벤트, 2:공지사항 ',
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // type: number;
}
