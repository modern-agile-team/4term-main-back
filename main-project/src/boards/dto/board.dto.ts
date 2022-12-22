import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
export class BoardDto {
  @ApiProperty({
    example: '크리스마스를 즐기자',
    description: '게시글 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '산타와 함께 크리스마스를 즐길 사람 급구@@@@@@',
    description: '게시글 내용',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 0,
    description: '약속 성사 표시, 진행 중 : 0, 성사완료 : 1',
  })
  @IsBoolean()
  @IsNotEmpty()
  isDone: boolean;

  @ApiProperty({ example: '노원 술먹구 가', description: '약속 장소' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '2022-12-25 19:30:00', description: '약속 시간' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  meetingTime: Date;

  @ApiProperty({ example: 2, description: '남자 인원수' })
  @IsNumber()
  @IsNotEmpty()
  male: number;

  @ApiProperty({ example: 2, description: '여자 인원수' })
  @IsNumber()
  @IsNotEmpty()
  female: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'host members userNo',
  })
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  hostMembers: number[];

  // 삭제 예정
  @ApiProperty({
    example: "host userNo -> jwt로 빠질 예정",
    description: 'host user_no',
  })
  @IsNumber()
  @IsNotEmpty()
  userNo: number;
}
