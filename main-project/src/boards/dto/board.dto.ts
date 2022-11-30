import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
export class BoardDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '크리스마스를 즐기자',
    description: '게시글 제목',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '산타와 함께 크리스마스를 즐길 사람 급구@@@@@@',
    description: '게시글 내용',
  })
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: 0,
    description: '약속 성사 표시, 진행 중 : 0, 성사완료 : 1',
  })
  isDone: boolean;

  @IsString()
  @ApiProperty({ example: '노원 술먹구 가', description: '약속 장소' })
  location: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @ApiProperty({ example: '2022-12-25 19:30:00', description: '약속 시간' })
  meetingTime: Date;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 2, description: '남자 인원수' })
  male: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 2, description: '여자 인원수' })
  female: number;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    example: ['modern', 'agile', '4term'],
    description: 'host members',
  })
  hostMembers: [];

  // 삭제 예정
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: "host userNo -> jwt로 빠질 예정",
    description: 'host user_no',
  })
  userNo: number;
}
